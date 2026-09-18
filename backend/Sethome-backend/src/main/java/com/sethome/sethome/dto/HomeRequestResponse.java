package com.sethome.sethome.dto;

import java.time.LocalDateTime;

import com.sethome.sethome.model.HomeRequest;
import com.sethome.sethome.model.HomeRequestStatus;

public class HomeRequestResponse {

    final private Long requestId;
    final private Long roomId;

    final private String roomTitle;
    final private String roomLocation;
    final private String roomPrice;

    final private String name;
    final private String phone;
    final private Integer age;
    final private String occupation;
    final private String qualification;
    final private String puneDuration;
    final private String message;

    final private HomeRequestStatus status;
    final private String adminReason;

    final private LocalDateTime createdAt;
    final private LocalDateTime updatedAt;


    public HomeRequestResponse(HomeRequest request) {

        this.requestId = request.getId();

        this.roomId =
                request.getRoom().getId();

        this.roomTitle =
                request.getRoom().getTitle();

        this.roomLocation =
                request.getRoom().getLocation();

        this.roomPrice =
                request.getRoom().getPrice();

        this.name =
                request.getName();

        this.phone =
                request.getPhone();

        this.age =
                request.getAge();

        this.occupation =
                request.getOccupation();

        this.qualification =
                request.getQualification();

        this.puneDuration =
                request.getPuneDuration();

        this.message =
                request.getMessage();

        this.status =
                request.getStatus();

        this.adminReason =
                request.getAdminReason();

        this.createdAt =
                request.getCreatedAt();

        this.updatedAt =
                request.getUpdatedAt();
    }


    public Long getRequestId() {
        return requestId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRoomTitle() {
        return roomTitle;
    }

    public String getRoomLocation() {
        return roomLocation;
    }

    public String getRoomPrice() {
        return roomPrice;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public Integer getAge() {
        return age;
    }

    public String getOccupation() {
        return occupation;
    }

    public String getQualification() {
        return qualification;
    }

    public String getPuneDuration() {
        return puneDuration;
    }

    public String getMessage() {
        return message;
    }

    public HomeRequestStatus getStatus() {
        return status;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}