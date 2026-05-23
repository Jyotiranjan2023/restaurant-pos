package com.restaurantpos.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from-email}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    /**
     * Send password reset email with reset code.
     * Async so the API call returns quickly even if SMTP is slow.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String resetCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Restaurant POS — Password Reset Code");

            String htmlBody = buildPasswordResetHtml(userName, resetCode);
            helper.setText(htmlBody, true);  // true = isHtml

            mailSender.send(message);

            log.info("Password reset email sent to {}", toEmail);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            // Don't throw — async, can't bubble up. Log and move on.
        }
    }

    /**
     * Build the HTML body for the password reset email.
     * Simple, clean, mobile-friendly.
     */
    private String buildPasswordResetHtml(String userName, String resetCode) {
        return "<!DOCTYPE html>"
                + "<html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>"
                + "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px;'>"
                + "<h2 style='color: #2563eb; margin-top: 0;'>Restaurant POS</h2>"
                + "<p>Hello <strong>" + escapeHtml(userName) + "</strong>,</p>"
                + "<p>You requested a password reset for your Restaurant POS account.</p>"
                + "<p>Your reset code is:</p>"
                + "<div style='background-color: #f0f4ff; border: 2px dashed #2563eb; "
                + "padding: 20px; text-align: center; font-size: 28px; font-weight: bold; "
                + "letter-spacing: 4px; color: #2563eb; border-radius: 6px; margin: 20px 0;'>"
                + escapeHtml(resetCode)
                + "</div>"
                + "<p>This code will expire in <strong>30 minutes</strong>.</p>"
                + "<p>If you did not request a password reset, please ignore this email or contact support.</p>"
                + "<hr style='border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;'>"
                + "<p style='color: #6b7280; font-size: 12px;'>This is an automated message from Restaurant POS. Please do not reply to this email.</p>"
                + "</div>"
                + "</body></html>";
    }

    /**
     * Basic HTML escape to prevent injection in the email body.
     */
    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}