package com.restaurantpos.backend.service;

import com.restaurantpos.backend.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final List<String> ALLOWED_EXTENSIONS =
            Arrays.asList("jpg", "jpeg", "png", "webp");

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.upload.max-size-mb}")
    private long maxSizeMb;

    private Path productImagesPath;

    /**
     * Runs once at startup — creates the upload folders if they don't exist.
     */
    @PostConstruct
    public void init() {
        try {
            this.productImagesPath = Paths.get(uploadDir, "products").toAbsolutePath().normalize();
            Files.createDirectories(productImagesPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directories", e);
        }
    }

    /**
     * Saves a product image and returns the public URL path.
     * Example return: "/uploads/products/abc123.jpg"
     */
    public String saveProductImage(MultipartFile file) {
        validateFile(file);

        try {
            String extension = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + extension;
            Path targetPath = productImagesPath.resolve(filename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    /**
     * Deletes a file given its public URL path.
     * Silently ignores missing files (safe to call even if URL is wrong).
     */
    public void deleteProductImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {
            // Extract just the filename from URL like "/uploads/products/abc.jpg"
            String filename = Paths.get(imageUrl).getFileName().toString();
            Path filePath = productImagesPath.resolve(filename);

            // Delete only if inside our products folder (security check)
            if (filePath.normalize().startsWith(productImagesPath)) {
                Files.deleteIfExists(filePath);
            }
        } catch (Exception e) {
            // Log but don't fail — deletion is cleanup, not critical
            System.err.println("Failed to delete file: " + imageUrl + " — " + e.getMessage());
        }
    }

    // ========== Validation ==========

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new BadRequestException("File is empty");

        // Size check
        long maxBytes = maxSizeMb * 1024 * 1024;
        if (file.getSize() > maxBytes)
            throw new BadRequestException("File too large. Max size: " + maxSizeMb + " MB");

        // Extension check
        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase()))
            throw new BadRequestException(
                "Invalid file type. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));

        // Basic content-type sanity check
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            throw new BadRequestException("File must be an image");
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains("."))
            throw new BadRequestException("File has no extension");
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}