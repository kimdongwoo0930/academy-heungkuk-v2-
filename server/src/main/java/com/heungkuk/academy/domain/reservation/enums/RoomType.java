package com.heungkuk.academy.domain.reservation.enums;

import java.util.List;

public enum RoomType {
    SINGLE(List.of("109", "126"), "1인실"),
    DOUBLE(List.of("110", "111", "127"), "2인실"),
    QUAD(List.of("101", "102", "103", "104", "105",
                 "106", "107", "108", "112", "113",
                 "114", "115", "116", "117", "118",
                 "119", "120", "121", "122", "123",
                 "124", "125"), "4인실");

    private final List<String> rooms;
    private final String displayName;

    RoomType(List<String> rooms, String displayName) {
        this.rooms = rooms;
        this.displayName = displayName;
    }

    public List<String> getRooms() { return rooms; }
    public String getDisplayName() { return displayName; }

    public static String getDisplayNameByRoomNumber(String roomNumber) {
        for (RoomType type : values()) {
            if (type.rooms.contains(roomNumber)) return type.displayName;
        }
        return "4인실";
    }
}
