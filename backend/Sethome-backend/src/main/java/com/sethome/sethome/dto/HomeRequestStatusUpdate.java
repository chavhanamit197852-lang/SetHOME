package com.sethome.sethome.dto;

import com.sethome.sethome.model.HomeRequestStatus;

public class HomeRequestStatusUpdate {

    private HomeRequestStatus status;
    private String reason;

    public HomeRequestStatus getStatus() {
        return status;
    }

    public void setStatus(HomeRequestStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}