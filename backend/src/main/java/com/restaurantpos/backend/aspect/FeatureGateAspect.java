package com.restaurantpos.backend.aspect;

import com.restaurantpos.backend.annotation.RequiresFeature;
import com.restaurantpos.backend.service.FeatureGateService;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Spring AOP aspect that enforces @RequiresFeature annotations.
 * 
 * Whenever a method marked with @RequiresFeature("has_inventory") is called,
 * this aspect runs BEFORE the method and checks if the tenant's plan
 * includes the required feature.
 * 
 * If the plan doesn't include it, throws FeatureGateException (HTTP 402).
 * If it does, method continues normally.
 */
@Aspect
@Component
public class FeatureGateAspect {

    private static final Logger log = LoggerFactory.getLogger(FeatureGateAspect.class);

    @Autowired
    private FeatureGateService featureGateService;

    /**
     * Intercepts every call to a method annotated with @RequiresFeature.
     * 
     * The pointcut expression: "@annotation(requiresFeature)"
     *   - Matches methods that have the @RequiresFeature annotation
     *   - Binds the annotation instance to the requiresFeature parameter
     *   - So we can read its value() property
     */
    @Before("@annotation(requiresFeature)")
    public void checkFeatureBefore(RequiresFeature requiresFeature) {
        String featureCode = requiresFeature.value();
        
        log.debug("Feature gate check: {}", featureCode);
        
        // This throws FeatureGateException if blocked
        // GlobalExceptionHandler catches it and returns 402 response
        featureGateService.checkFeature(featureCode);
        
        log.debug("Feature gate passed: {}", featureCode);
    }
}