package com.restaurantpos.backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TaxSettingsRequest {

    @NotNull
    @DecimalMin(value = "0.0", message = "GST cannot be negative")
    @DecimalMax(value = "100.0", message = "GST cannot exceed 100%")
    private BigDecimal defaultGstPercent;

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0", message = "CGST split cannot exceed 100%")
    private BigDecimal cgstSplitPercent;

    @NotNull
    @DecimalMin(value = "0.0", message = "Service charge cannot be negative")
    @DecimalMax(value = "100.0", message = "Service charge cannot exceed 100%")
    private BigDecimal serviceChargePercent;

    private Boolean serviceChargeAppliesDineIn;
    private Boolean serviceChargeAppliesTakeaway;
    private Boolean serviceChargeAppliesDelivery;

    public BigDecimal getDefaultGstPercent() { return defaultGstPercent; }
    public void setDefaultGstPercent(BigDecimal defaultGstPercent) { this.defaultGstPercent = defaultGstPercent; }

    public BigDecimal getCgstSplitPercent() { return cgstSplitPercent; }
    public void setCgstSplitPercent(BigDecimal cgstSplitPercent) { this.cgstSplitPercent = cgstSplitPercent; }

    public BigDecimal getServiceChargePercent() { return serviceChargePercent; }
    public void setServiceChargePercent(BigDecimal serviceChargePercent) { this.serviceChargePercent = serviceChargePercent; }

    public Boolean getServiceChargeAppliesDineIn() { return serviceChargeAppliesDineIn; }
    public void setServiceChargeAppliesDineIn(Boolean serviceChargeAppliesDineIn) { this.serviceChargeAppliesDineIn = serviceChargeAppliesDineIn; }

    public Boolean getServiceChargeAppliesTakeaway() { return serviceChargeAppliesTakeaway; }
    public void setServiceChargeAppliesTakeaway(Boolean serviceChargeAppliesTakeaway) { this.serviceChargeAppliesTakeaway = serviceChargeAppliesTakeaway; }

    public Boolean getServiceChargeAppliesDelivery() { return serviceChargeAppliesDelivery; }
    public void setServiceChargeAppliesDelivery(Boolean serviceChargeAppliesDelivery) { this.serviceChargeAppliesDelivery = serviceChargeAppliesDelivery; }
}