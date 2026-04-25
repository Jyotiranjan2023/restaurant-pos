package com.restaurantpos.backend.dto.response;

public class UnreadCountResponse {

    private Long unreadCount;

    public UnreadCountResponse() {}

    public UnreadCountResponse(Long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public Long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Long unreadCount) { this.unreadCount = unreadCount; }
}