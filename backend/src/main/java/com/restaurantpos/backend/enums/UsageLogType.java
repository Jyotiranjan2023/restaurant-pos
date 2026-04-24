package com.restaurantpos.backend.enums;

public enum UsageLogType {
    CONSUMPTION,   // stock used when order placed
    RESTOCK,       // stock added (purchase/delivery)
    ADJUSTMENT,    // manual correction
    WASTAGE        // spoilage or loss
}