from rest_framework import viewsets, permissions , generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .models import JobApplication
from .serializers import JobApplicationSerializer , RegisterSerializer , UserProfileSerializer
import google.generativeai as genai
from django.conf import settings


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]     


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user    


# _______ Change password _____________


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({'error': list(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


# ── Forgot Password ───

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'If this email exists, a reset link has been sent'}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5174/reset-password/{uid}/{token}/"

        send_mail(
            'Password Reset - Job Tracker Pro',
            f'Click here to reset your password: {reset_link}',
            'noreply@jobtracker.com',
            [email],
        )
        return Response({'message': 'If this email exists, a reset link has been sent'}, status=status.HTTP_200_OK)


# ── Reset Password ───

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'Invalid link'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired link'}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get('new_password')
        try:
            validate_password(new_password, user)
        except Exception as e:
            return Response({'error': list(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)    


# ── Delete Account ──

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        user = request.user

        if not user.check_password(password):
            return Response({'error': 'Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)  


# ── Update Name ─────────────────────────────────────────────────────────

class UpdateNameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        name = request.data.get('name', '').strip()

        if not name:
            return Response({'error': 'Name cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        user.first_name = name
        user.save()
        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)        


# ── AI Follow-up Email Generator ────────────────────────────────────────

class GenerateFollowUpEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        application_id = request.data.get('application_id')

        try:
            application = JobApplication.objects.get(id=application_id, user=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.6-flash')

        prompt = f"""Write a short, professional follow-up email for a job application.

Company: {application.company}
Role: {application.role}
Applied on: {application.applied_date}
Current status: {application.status}

The email should be polite, concise (under 150 words), express continued 
interest, and politely ask for an update. Include a subject line at the top 
starting with "Subject:". Do not include placeholder brackets like [Your Name] 
- just write "Best regards," at the end without a name.
"""

        try:
            response = model.generate_content(prompt)
            return Response({'email': response.text}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      