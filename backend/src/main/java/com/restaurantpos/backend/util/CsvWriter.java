package com.restaurantpos.backend.util;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

/**
 * Lightweight CSV writer that streams directly to HttpServletResponse.
 * Handles UTF-8 BOM for Excel compatibility (₹ and other special chars).
 */
public class CsvWriter implements AutoCloseable {

    private final PrintWriter writer;

    public CsvWriter(HttpServletResponse response, String filename) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        // Write BOM so Excel correctly detects UTF-8
        response.getOutputStream().write(0xEF);
        response.getOutputStream().write(0xBB);
        response.getOutputStream().write(0xBF);

        this.writer = new PrintWriter(
            new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8),
            false   // we'll flush manually
        );
    }

    /**
     * Write a single row. Each cell auto-escaped (handles commas, quotes, newlines).
     */
    public void writeRow(Object... cells) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < cells.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(escape(cells[i]));
        }
        sb.append("\r\n");   // CRLF for Windows/Excel compatibility
        writer.write(sb.toString());
    }

    private String escape(Object value) {
        if (value == null) return "";
        String s = value.toString();

        // If contains comma, quote, or newline → wrap in quotes and escape inner quotes
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    public void flush() {
        writer.flush();
    }

    @Override
    public void close() {
        writer.flush();
        writer.close();
    }
}