/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/providers/I18nProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Enhanced language definitions
export const SUPPORTED_LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr',
        region: 'US',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        currency: 'USD'
    },
    {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr',
        region: 'ES',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'EUR'
    },
    {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr',
        region: 'FR',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'EUR'
    },
    {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        direction: 'ltr',
        region: 'DE',
        dateFormat: 'dd.MM.yyyy',
        timeFormat: '24h',
        currency: 'EUR'
    },
    {
        code: 'it',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        direction: 'ltr',
        region: 'IT',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'EUR'
    }
];

// Enhanced translation keys including event forms
// Enhanced translation keys including event forms AND promo codes
export interface TranslationKeys {
    // Common
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    back: string;
    create: string;
    update: string;

    // Navigation
    dashboard: string;
    events: string;
    settings: string;
    profile: string;
    logout: string;

    // Settings
    personalInformation: string;
    organization: string;
    notifications: string;
    security: string;
    appearance: string;
    language: string;
    preferences: string;

    // Profile
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;

    // Events
    createEvent: string;
    editEvent: string;
    eventTitle: string;
    eventDescription: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    ticketPrice: string;
    yourEvents: string;
    createYourFirstEvent: string;
    createFirstEventPrompt: string;
    eventsSubtitle: string;
    allEvents: string;
    searchEvents: string;
    unpublished: string;
    noDescriptionAvailable: string;
    dateNotSet: string;
    invalidDate: string;
    timeNotSet: string;
    invalidTime: string;
    confirmDeleteEvent: string;
    failedToDeleteEvent: string;
    failedToTogglePublish: string;
    noEventsMatchSearch: string;
    adjustSearchCriteria: string;

    // Event Form - New translations
    createNewEvent: string;
    editEventDetails: string;
    fillEventDetails: string;
    updateEventDetails: string;
    basicInformation: string;
    eventTitleRequired: string;
    enterEventTitle: string;
    descriptionRequired: string;
    describeEventDetail: string;
    categoryRequired: string;
    selectCategory: string;
    maxCapacityRequired: string;
    maximumAttendees: string;
    eventImageUrl: string;
    enterImageUrl: string;

    // Date & Time Section
    dateTime: string;
    multiDayEvent: string;
    dayEvent: string;
    startDateTime: string;
    startDateTimeRequired: string;
    endDateTime: string;
    leaveEmptySingleSession: string;
    endDateAfterStart: string;
    registrationDeadline: string;
    whenRegistrationClose: string;
    registrationDeadlineBeforeEvent: string;

    // Location Section
    location: string;
    onlineEvent: string;
    venueRequired: string;
    selectVenue: string;
    locationDetails: string;
    meetingLinkPlatform: string;
    additionalLocationInfo: string;

    // Ticket Types Section
    ticketTypes: string;
    addTicketType: string;
    ticketTypesCount: string;
    totalTypes: string;
    editable: string;
    locked: string;
    noTicketTypesYet: string;
    addTicketTypesToStart: string;
    createFirstTicketType: string;
    ticketTypeName: string;
    ticketTypeNameRequired: string;
    ticketDescription: string;
    optionalTicketDescription: string;
    price: string;
    priceRequired: string;
    quantity: string;
    quantityRequired: string;
    quantityGreaterThanZero: string;
    ticketActive: string;
    availableForPurchase: string;
    createTicketType: string;
    updateTicketType: string;
    editTicketType: string;

    // Smart Editing System
    smartTicketEditing: string;
    whenCanEdit: string;
    eventDraftStatus: string;
    noTicketsSold: string;
    eventNotPublished: string;
    whenEditingLocked: string;
    eventIsPublished: string;
    ticketsAlreadySold: string;
    eventStatusNotDraft: string;
    lockedToPreserve: string;
    ticketsSoldCount: string;
    cannotCreateTicketTypes: string;
    salesDataIntegrity: string;

    // Publishing
    publishingOptions: string;
    publishEventImmediately: string;
    makeVisiblePublic: string;
    publishUnpublishLater: string;
    currentlyPublished: string;
    currentlyUnpublished: string;
    usePublishButtons: string;
    changePublishStatus: string;

    // Form Validation
    fixErrorsBelow: string;
    formValidationError: string;
    requiredField: string;
    invalidInput: string;

    // Success/Error Messages
    eventCreatedSuccessfully: string;
    eventUpdatedSuccessfully: string;
    ticketTypeCreatedSuccessfully: string;
    ticketTypeUpdatedSuccessfully: string;
    failedToCreateEvent: string;
    failedToUpdateEvent: string;
    failedToCreateTicketType: string;
    failedToUpdateTicketType: string;
    creatingEvent: string;
    updatingEvent: string;
    redirectingToDashboard: string;
    redirectingToEventDetail: string;

    // Capacity and Venues
    capacity: string;
    venue: string;
    selectAVenue: string;
    venueWithCapacity: string;

    // Categories
    category: string;
    technology: string;
    business: string;
    music: string;
    sports: string;
    education: string;

    // Event States
    published: string;
    draft: string;
    online: string;
    inPerson: string;

    // Multi-day events
    multiDaySchedule: string;

    // Venue Management - New translations
    venues: string;
    createVenue: string;
    venueName: string;
    venueNameRequired: string;
    enterVenueName: string;
    venueAddress: string;
    addressRequired: string;
    enterVenueAddress: string;
    venueState: string;
    enterState: string;
    enterStateOptional: string;
    venueCountry: string;
    countryRequired: string;
    enterCountry: string;
    venueZipCode: string;
    enterZipCode: string;
    enterZipCodeOptional: string;
    capacityRequired: string;
    maximumCapacity: string;
    contactEmail: string;
    contactPhone: string;
    website: string;
    latitude: string;
    longitude: string;
    description: string;
    venueDescription: string;
    describeVenue: string;
    venueImageUrl: string;
    validEmailRequired: string;
    latitudeBetween: string;
    longitudeBetween: string;
    optionalMapIntegration: string;
    createNewVenue: string;
    venueCreatedSuccessfully: string;
    failedToCreateVenue: string;
    failedToFetchVenues: string;
    creatingVenue: string;
    loadingVenues: string;
    searchVenues: string;
    allCities: string;
    noVenuesFound: string;
    adjustFilters: string;
    getStartedFirstVenue: string;
    venueLocation: string;
    venueCapacity: string;
    venueEvents: string;
    venueStatus: string;
    active: string;
    inactive: string;
    eventsCount: string;
    viewAvailableVenues: string;
    createNewOnes: string;

    // Ticket Management - New translations
    tickets: string;
    ticketManagement: string;
    manageTicketTypes: string;
    validateTickets: string;
    checkIn: string;
    ticketValidation: string;
    ticketCheckIn: string;
    ticketsAndCheckIn: string;

    // Ticket Types Management
    createTicketTypeAction: string;
    ticketTypeLimitations: string;
    publishedEventsRestriction: string;
    eventsWithSalesRestriction: string;
    draftStatusRequired: string;
    alternativeCreateEvent: string;
    onlyWorksForDraft: string;
    createNewEventLink: string;
    manageEventsLink: string;

    // Ticket Form
    selectAnEvent: string;
    ticketCreationRequirements: string;
    eventMustBeDraft: string;
    noExistingTicketSales: string;
    mustBeEventOrganizer: string;
    editTicketsDuringCreation: string;
    ticketEvent: string;
    eventRequired: string;
    noEventsFound: string;
    needCreateEventFirst: string;

    // Ticket Types Display
    loadingTicketTypes: string;
    noTicketTypesFound: string;
    adjustFiltersOrCreate: string;
    createFirstTicketTypePrompt: string;
    ticketType: string;
    event: string;
    availability: string;
    status: string;
    remaining: string;

    // Validation Tab
    validateTicket: string;
    enterTicketNumber: string;
    validating: string;
    validate: string;
    validTicket: string;
    invalidTicket: string;
    ticketNumber: string;
    attendeeName: string;
    alreadyUsed: string;
    notUsed: string;

    // Check-in Tab
    checkInTicket: string;
    enterTicketNumberCheckIn: string;
    checkingIn: string;
    ticketCheckedInSuccessfully: string;

    // Ticket Warnings
    importantTicketLimitations: string;
    cannotModifyPublished: string;
    editingLockedAfterSales: string;
    draftStatusForCreation: string;
    createNewEventAlternative: string;

    // Business Rules
    businessRulesWarning: string;

    // Ticket States
    ticketInactive: string;

    // General UI
    optional: string;
    required: string;

    // Appearance
    theme: string;
    lightMode: string;
    darkMode: string;
    autoMode: string;
    accentColor: string;
    fontSize: string;
    compactMode: string;

    // Time and Date
    timeFormat: string;
    dateFormat: string;
    currency: string;
    timezone: string;

    // Messages
    saveSuccess: string;
    saveError: string;
    loadError: string;

    // Dashboard specific (keeping existing ones)
    welcomeBack: string;
    virtualEvent: string;
    viewAllEvents: string;
    upcomingEvents: string;
    unpublish: string;
    unlimited: string;
    uncategorized: string;
    totalRevenue: string;
    totalEvents: string;
    ticketsSold: string;
    revenue: string;
    publish: string;
    noEventsYet: string;
    maxCapacity: string;
    loadingDashboard: string;
    dashboardError: string;
    publishedCount: string;

    // Analytics Dashboard
    analytics: string;
    analyticsSubtitle: string;
    comprehensiveInsights: string;
    refreshData: string;
    someDataCouldntBeLoaded: string;

    // Key Metrics
    totalAttendees: string;
    activeEvents: string;
    venuesUsed: string;
    fromLastMonth: string;
    noRevenueYet: string;
    noAttendeesYet: string;
    eventsRunning: string;
    noActiveEvents: string;
    venuePartnerships: string;
    noVenuesYet: string;

    // Charts and Analytics
    topRevenueEvents: string;
    noEventsWithRevenueData: string;
    createAndPublishEvents: string;
    seeRevenueAnalytics: string;
    paymentMethodDistribution: string;
    noPaymentDataAvailable: string;
    eventCapacityUtilization: string;
    utilizationPercentage: string;
    noEventsFoundForPeriod: string;
    monthlyTrends: string;

    // Demographics
    genderDistribution: string;
    noDemographicDataAvailable: string;
    venuePerformance: string;
    avgAttendance: string;
    noVenueDataAvailable: string;

    // Events Needing Attention
    eventsNeedingAttention: string;
    utilization: string;
    daysUntilEvent: string;
    potentialIssues: string;
    recommendations: string;
    allEventsPerformingWell: string;
    noEventsWithLowAttendance: string;

    // Time periods
    last7Days: string;
    last30Days: string;
    last3Months: string;
    last6Months: string;
    lastYear: string;

    // Status messages
    checkingAuthentication: string;
    authenticationRequired: string;
    pleaseLogInToView: string;
    goToLogin: string;

    // Orders and remaining
    orders: string;

    organizationInformation: string;
    businessLicense: string;

    // Notification Settings
    emailNotifications: string;
    smsNotifications: string;
    newBookings: string;
    getNotifiedNewBooking: string;
    cancellations: string;
    getNotifiedCancellations: string;
    lowInventoryNotifications: string;
    dailyReports: string;
    receiveDailySummary: string;
    weeklyReports: string;
    receiveWeeklyAnalytics: string;
    monthlyReports: string;

    // Security Settings
    securitySettings: string;
    twoFactorAuthentication: string;
    addExtraLayerSecurity: string;
    loginNotifications: string;
    getNotifiedNewLogins: string;
    sessionTimeout: string;
    sessionTimeoutMinutes: string;

    // Password Settings
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    minimumCharacters: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    changingPassword: string;
    passwordChanged: string;

    // Event Default Settings
    eventDefaults: string;
    defaultEventDuration: string;
    defaultEventDurationMinutes: string;
    ticketSaleStart: string;
    ticketSaleStartDays: string;
    defaultRefundPolicy: string;
    requireApproval: string;
    requireApprovalBeforeLive: string;
    autoPublish: string;
    autoPublishWhenCreated: string;

    // Language & Region Settings
    languageRegion: string;
    languagePreferences: string;
    regionalFormats: string;
    interfaceLanguage: string;
    timeDateFormats: string;
    currencySettings: string;
    livePreview: string;

    // Time Format Settings
    hour12Format: string;
    hour24Format: string;

    // Date Format Settings
    dateFormatExample: string;

    // Display Settings
    displaySettings: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    reduceSpacing: string;

    // Theme Settings
    themeSettings: string;
    choosePreferredTheme: string;
    cleanBrightInterface: string;
    easyOnEyes: string;
    followsSystemPreference: string;
    accentColorSettings: string;
    chooseAccentColor: string;

    // Success Messages
    settingsSavedSuccessfully: string;
    profileUpdatedSuccessfully: string;
    organizationUpdatedSuccessfully: string;
    preferencesUpdatedSuccessfully: string;

    // Error Messages
    failedToUpdateProfile: string;
    failedToUpdateOrganization: string;
    failedToUpdatePreferences: string;
    failedToChangePassword: string;

    // Loading States
    loadingProfile: string;
    savingChanges: string;

    // Authentication
    pleaseLoginToAccess: string;

    // General Settings
    manageAccount: string;
    eventPreferences: string;
    saved: string;
    saveChanges: string;

    // Verification Status
    emailNotVerified: string;
    phoneNotVerified: string;
    verified: string;

    // Color Names
    blue: string;
    purple: string;
    green: string;
    red: string;
    orange: string;
    pink: string;

    // Size Names
    small: string;
    medium: string;
    large: string;

    // Image Management - Add these new keys
    eventImages: string;
    bannerImage: string;
    bannerImageDescription: string;
    eventImage: string;
    eventImageDescription: string;
    noBannerImage: string;
    noEventImage: string;
    changeBanner: string;
    uploadBanner: string;
    changeImage: string;
    uploadImage: string;
    uploadingImages: string;
    imageGuidelines: string;
    supportedFormats: string;
    maxFileSize: string;
    bannerRecommended: string;
    imageRecommended: string;
    invalidImageFile: string;
    imageUploadFailed: string;
    imageUploadSuccess: string;
    selectImageFile: string;
    imageProcessing: string;
    imagePreview: string;
    removeImage: string;
    cropImage: string;
    rotateImage: string;
    imageQuality: string;
    compressImage: string;
    dropImageHere: string;

    // PROMO CODES - Missing translations that need to be added
    promoCodes: string;
    createAndManageDiscountCodes: string;
    createPromoCode: string;
    editPromoCode: string;
    promoCodeAnalytics: string;

    // Stats and metrics
    totalCodes: string;
    activeCodes: string;
    totalUses: string;
    totalSavings: string;
    topPerformingCodes: string;

    // Search and filters
    searchPromoCodes: string;
    allStatus: string;
    allScopes: string;
    organizerWide: string;
    eventSpecific: string;
    expired: string;
    scheduled: string;
    usedUp: string;
    invalid: string;

    // Table headers
    code: string;
    details: string;
    usage: string;
    period: string;
    actions: string;

    // Promo code properties
    formattedValue: string;
    minimumOrderAmount: string;
    maximumDiscountAmount: string;
    currentUsage: string;
    maxUsage: string;
    startDate: string;
    endDate: string;

    // Actions and buttons
    copyCode: string;
    viewAnalytics: string;
    refresh: string;

    // Status messages
    copySuccess: string;
    deletePromoCodeConfirm: string;
    promoCodeDeletedSuccessfully: string;
    failedToDeletePromoCode: string;
    failedToLoadPromoCodes: string;
    loadingPromoCodes: string;

    // Empty states
    noPromoCodesYet: string;
    createFirstPromoCode: string;
    createFirstPromoCodeDescription: string;
    noPromoCodesMatchFilters: string;
    adjustSearchOrFilterCriteria: string;

    // Scope indicators
    eventSpecificDescription: string;
    organizerWideDescription: string;

    // Usage indicators
    uses: string;

    // Date formatting
    start: string;
    end: string;

    // Performance section
    topPerformingCodesDescription: string;
    numberOne: string;

    // Analytics related
    viewDetailedAnalytics: string;
    promoCodePerformance: string;

    // Form validation and creation
    promoCodeRequired: string;
    promoCodeFormat: string;
    discountValueRequired: string;
    maxUsageRequired: string;
    startDateRequired: string;
    endDateRequired: string;
    endDateAfterStartDate: string;

    // Type indicators
    percentageOff: string;
    fixedAmountOff: string;

    // Create/Edit specific
    basicSettings: string;
    discountSettings: string;
    scopeSettings: string;
    usageSettings: string;
    advancedSettings: string;

    // Success messages
    promoCodeCreatedSuccessfully: string;
    promoCodeUpdatedSuccessfully: string;

    // Error messages
    failedToCreatePromoCode: string;
    failedToUpdatePromoCode: string;
    cannotEditUsedPromoCode: string;

    // Analytics specific
    usageByDay: string;
    usageByEvent: string;
    conversionRate: string;
    averageDiscount: string;
    totalOrderValue: string;

    // Status descriptions
    activeDescription: string;
    inactiveDescription: string;
    expiredDescription: string;
    scheduledDescription: string;

    editing: string;
    used: string;
    discountType: string;
    typeCannotBeChanged: string;
    codeCannotBeChanged: string;
    optionalDescriptionReference: string;
    orderMustBeAtLeast: string;
    capMaximumDiscount: string;
    promoCodeScope: string;
    scopeCannotBeChanged: string;
    maxUsagePerUser: string;
    limitUsagePerUser: string;
    statusSettings: string;
    activeStatus: string;
    inactivePromoCodesNote: string;
    promoCodeWillBeDeactivated: string;
    editingGuidelines: string;
    safeToEdit: string;
    cannotEdit: string;
    descriptionAndNotes: string;
    endDateExtendOnly: string;
    maxUsageIncreaseOnly: string;
    activeInactiveStatus: string;
    promoCodeItself: string;
    discountTypeAndValue: string;
    scopeAndEventAssignment: string;
    anyFieldIfUsed: string;
    changesEffectNote: string;
    hide: string;
    show: string;
    preview: string;

    // Form validation messages
    codeCannotBeChangedAfterCreation: string;
    optionalDescriptionForInternalReference: string;
    typeCannotBeChangedAfterCreation: string;
    scopeCannotBeChangedAfterCreation: string;
    orderMustBeAtLeastThisAmount: string;
    capMaximumDiscountAmountForPercentage: string;
    limitHowManyTimesEachUserCanUse: string;
    inactivePromoCodesCannotBeUsed: string;

    // Performance and usage messages
    promoCodeHasBeenUsedTimes: string;
    editingDisabledToPreserveIntegrity: string;
    performanceInsights: string;
    usageRate: string;
    timesUsed: string;
    promoCodeHasBeenUsedAndLocked: string;
    changesEffectImmediately: string;

    // Status and validation
    currentUsageCannotReduceBelow: string;
    discountValueMustBePositive: string;
    percentageValueCannotExceed100: string;
    fixedAmountCannotExceed10000: string;
    startDateCannotBeInPast: string;
    endDateCannotBeMoreThan2Years: string;
    maximumUsageCountCannotExceed10000: string;
    minimumOrderAmountCannotExceed100000: string;
    maximumDiscountAmountCannotExceed10000: string;
    maximumDiscountCannotExceedValue: string;
    maxUsagePerUserCannotExceed100: string;

    // UI toggles
    showAdvancedOptions: string;
    hideAdvancedOptions: string;

    // Help and guidance
    warning: string;

    dateandusagesettings: string;
    maximumusage: string;
    maximumusageperusers: string;
    detailedPerformanceMetrics: string;

    totalDiscountsGiven: string;

    overview: string;
    usagehistory: string;
    timeline: string;
    usedCount: string;
    customersavings: string;
    orderValue: string;
    totalrevenueimpact: string;

    statustext: string;

    ofMaximumUsage: string;
    discount: string;

    analyticsInformation: string;
    metricsIncluded: string;

    // Missing promo code properties
    promoCodeNotUsedYet: string;
    promoCodeDetails: string;

    // Missing analytics properties
    usageHistoryShowsAll: string;
    timelineDataAggregated: string;
    revenueImpactAnalysis: string;
    realTimeUsageTracking: string;
    historicalDataPreserved: string;
    eventSpecificPerformance: string;
    dataUpdates: string;
    customerBehaviorInsights: string;
    conversionRatesCalculated: string;
    analyticsUpdateRealTime: string;
    analyticsDataUpdatedImmediately: string;
    allMonetaryValuesUSD: string;

    customer: string;
    order: string;
    subtotal: string;
    date: string;

    thispromohasntbeenused: string;
    nousageyet: string;
    notimelinedata: string;
    usageTimelineMessage: string;

    peakDay: string;
    averageDaily: string;
    activeDays: string;
    noTimelineData: string;
    timelineWillAppear: string;
    analyticsNotFound: string;
    unableToLoadAnalytics: string;

    backToPromoCodes: string;

    retry: string;
    loadingAnalytics: string;
    unknown: string;
    usageHistory: string;

    noimagesavailable: string;
    loadingevents: string;

    // Events Page - Hero Section
    discoverEvents: string;
    eventsAcrossCategories: string;
    searchPlaceholder: string;
    filters: string;

    // Events Page - Gallery
    galleryShowcase: string;
    featuredEventsAndVenues: string;

    // Events Page - Event Cards
    today: string;
    tomorrow: string;
    soon: string;
    inDays: string;
    limited: string;
    from: string;
    viewAndBook: string;
    at: string;

    // Events Page - Sections
    searchResults: string;
    resultsFor: string;
    exploreAllEvents: string;
    premierVenues: string;
    topEventLocations: string;
    hot: string;
    popular: string;


    // Events Page - Actions
    myTickets: string;
    signIn: string;
    clearFilters: string;

    // Events Page - Empty States
    noEventsAvailable: string;
    tryAdjustingSearch: string;
    eventsWillAppearSoon: string;

    // Events Page - Footer
    quickLinks: string;
    browseEvents: string;
    becomeAnOrganizer: string;
    contactUs: string;
    support: string;
    helpCenter: string;
    faq: string;
    contactSupport: string;
    privacyPolicy: string;
    termsOfService: string;
    stayUpdated: string;
    enterYourEmail: string;
    availableWorldwide: string;

    // Events Page - Time/Date
    scheduleText: string;

    // Additional missing keys from your events page
    featuredEvents: string;
    categories: string;

    clearSearch: string;
    ticketsavailable: string;   

    // Add these to your existing TranslationKeys interface
    by: string;
    eventsHosted: string;
    yourPremierDestination: string;
    connectWithExperiences: string;
    home: string;
    eventStreet: string;
    shahAlam: string;
    malaysia: string;
    monFriHours: string;
    satSunHours: string;
    allRightsReserved: string;
    eventBanner: string;
    eventGallery: string;
    eventNotFound: string;
    backToEvents: string;
    featured: string;
    aboutThisEvent: string;
    onlineEventNote: string;
    eventOrganizer: string;
    venueInformation: string;
    visitWebsite: string;
    inYourCart: string;
    items: string;
    remove: string;
    total: string;
    getTickets: string;
    available: string;
    noTicketsAvailable: string;
    maxPerOrder: string;
    addToCart: string;
    soldOut: string;
    notAvailable: string;
    proceedToCheckout: string;

    manageTickets: string;
    valid: string;
    cancelled: string;
    upcoming: string;
    pastEvents: string;
    attended: string;
    download: string;
    attendeeInformation: string;
    purchaseDetails: string;
    purchaseDate: string;
    checkInDate: string;
    viewEventDetails: string;

    // Order confirmation and profile specific translations
    orderNotFound: string;
    purchaseSuccessful: string;
    ticketsConfirmedSentEmail: string;
    eventDetails: string;
    orderDetails: string;
    orderNumber: string;
    totalAmount: string;
    orderDate: string;
    yourTickets: string;
    ticketsCount: string;
    qrCode: string;
    importantNotice: string;
    bringTicketsAndId: string;
    viewMyTickets: string;
    browseMoreEvents: string;
    checkEmailForDetails: string;
    downloadData: string;
    defaultTimeZone: string;

    serviceFee: string;
    tax: string;

    completePurchase: string;

    minutes: string;
    hours: string
    hour: string;

    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;

    jan: string;
    feb: string;
    mar: string;
    apr: string;
    may: string;
    jun: string;
    jul: string;
    aug: string;
    sep: string;
    oct: string;
    nov: string;
    dec: string;

}

interface SettingsTranslationKeys {
    // Organization Settings
    organizationInformation: string;
    businessLicense: string;

    // Notification Settings
    emailNotifications: string;
    smsNotifications: string;
    newBookings: string;
    getNotifiedNewBooking: string;
    cancellations: string;
    getNotifiedCancellations: string;
    lowInventoryNotifications: string;
    dailyReports: string;
    receiveDailySummary: string;
    weeklyReports: string;
    receiveWeeklyAnalytics: string;
    monthlyReports: string;

    // Security Settings
    securitySettings: string;
    twoFactorAuthentication: string;
    addExtraLayerSecurity: string;
    loginNotifications: string;
    getNotifiedNewLogins: string;
    sessionTimeout: string;
    sessionTimeoutMinutes: string;

    // Password Settings
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    minimumCharacters: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    changingPassword: string;
    passwordChanged: string;

    // Event Default Settings
    eventDefaults: string;
    defaultEventDuration: string;
    defaultEventDurationMinutes: string;
    ticketSaleStart: string;
    ticketSaleStartDays: string;
    defaultRefundPolicy: string;
    requireApproval: string;
    requireApprovalBeforeLive: string;
    autoPublish: string;
    autoPublishWhenCreated: string;

    // Language & Region Settings
    languageRegion: string;
    languagePreferences: string;
    regionalFormats: string;
    interfaceLanguage: string;
    timeDateFormats: string;
    currencySettings: string;
    livePreview: string;

    // Time Format Settings
    hour12Format: string;
    hour24Format: string;

    // Date Format Settings
    dateFormatExample: string;

    // Display Settings
    displaySettings: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    reduceSpacing: string;

    // Theme Settings
    themeSettings: string;
    choosePreferredTheme: string;
    cleanBrightInterface: string;
    easyOnEyes: string;
    followsSystemPreference: string;
    accentColorSettings: string;
    chooseAccentColor: string;

    // Success Messages
    settingsSavedSuccessfully: string;
    profileUpdatedSuccessfully: string;
    organizationUpdatedSuccessfully: string;
    preferencesUpdatedSuccessfully: string;

    // Error Messages
    failedToUpdateProfile: string;
    failedToUpdateOrganization: string;
    failedToUpdatePreferences: string;
    failedToChangePassword: string;

    // Loading States
    loadingProfile: string;
    savingChanges: string;

    // Authentication
    authenticationRequired: string;
    pleaseLoginToAccess: string;
    goToLogin: string;

    // General Settings
    manageAccount: string;
    eventPreferences: string;
    saved: string;
    saveChanges: string;

    // Verification Status
    emailNotVerified: string;
    phoneNotVerified: string;
    verified: string;

    // Color Names
    blue: string;
    purple: string;
    green: string;
    red: string;
    orange: string;
    pink: string;

    // Size Names
    small: string;
    medium: string;
    large: string;

    // Image Management - Add these new keys
    eventImages: string;
    bannerImage: string;
    bannerImageDescription: string;
    eventImage: string;
    eventImageDescription: string;
    noBannerImage: string;
    noEventImage: string;
    changeBanner: string;
    uploadBanner: string;
    changeImage: string;
    uploadImage: string;
    uploadingImages: string;
    imageGuidelines: string;
    supportedFormats: string;
    maxFileSize: string;
    bannerRecommended: string;
    imageRecommended: string;
    invalidImageFile: string;
    imageUploadFailed: string;
    imageUploadSuccess: string;
    selectImageFile: string;
    imageProcessing: string;
    imagePreview: string;
    removeImage: string;
    cropImage: string;
    rotateImage: string;
    imageQuality: string;
    compressImage: string;
    dropImageHere: string;

    // Page headers and navigation
    promoCodes: string;
    createAndManageDiscountCodes: string;
    createPromoCode: string;
    editPromoCode: string;
    promoCodeAnalytics: string;

    // Stats and metrics
    totalCodes: string;
    activeCodes: string;
    totalUses: string;
    totalSavings: string;
    topPerformingCodes: string;

    // Search and filters
    searchPromoCodes: string;
    allStatus: string;
    allScopes: string;
    organizerWide: string;
    eventSpecific: string;
    expired: string;
    scheduled: string;
    usedUp: string;
    invalid: string;

    // Table headers
    code: string;
    details: string;
    usage: string;
    period: string;
    actions: string;

    // Promo code properties
    formattedValue: string;
    minimumOrderAmount: string;
    maximumDiscountAmount: string;
    currentUsage: string;
    maxUsage: string;
    remaining: string;
    startDate: string;
    endDate: string;
    allEvents: string;

    // Actions and buttons
    copyCode: string;
    viewAnalytics: string;
    refresh: string;

    // Status messages
    copySuccess: string;
    deletePromoCodeConfirm: string;
    promoCodeDeletedSuccessfully: string;
    failedToDeletePromoCode: string;
    failedToLoadPromoCodes: string;
    loadingPromoCodes: string;

    // Empty states
    noPromoCodesYet: string;
    createFirstPromoCode: string;
    createFirstPromoCodeDescription: string;
    noPromoCodesMatchFilters: string;
    adjustSearchOrFilterCriteria: string;

    // Scope indicators
    eventSpecificDescription: string;
    organizerWideDescription: string;

    // Usage indicators
    uses: string;

    // Date formatting
    start: string;
    end: string;

    // Performance section
    topPerformingCodesDescription: string;
    numberOne: string;

    // Analytics related
    viewDetailedAnalytics: string;
    promoCodePerformance: string;

    // Form validation and creation
    promoCodeRequired: string;
    promoCodeFormat: string;
    discountValueRequired: string;
    maxUsageRequired: string;
    startDateRequired: string;
    endDateRequired: string;
    endDateAfterStartDate: string;

    // Type indicators
    percentageOff: string;
    fixedAmountOff: string;

    // Create/Edit specific
    basicSettings: string;
    discountSettings: string;
    scopeSettings: string;
    usageSettings: string;
    advancedSettings: string;

    // Success messages
    promoCodeCreatedSuccessfully: string;
    promoCodeUpdatedSuccessfully: string;

    // Error messages
    failedToCreatePromoCode: string;
    failedToUpdatePromoCode: string;
    cannotEditUsedPromoCode: string;

    // Analytics specific
    usageByDay: string;
    usageByEvent: string;
    conversionRate: string;
    averageDiscount: string;
    totalOrderValue: string;

    // Status descriptions
    activeDescription: string;
    inactiveDescription: string;
    expiredDescription: string;
    scheduledDescription: string;

    //attendee
    noimagesavailable: string;

    
}

const settingsTranslationsEn: SettingsTranslationKeys = {
    // Organization Settings
    organizationInformation: 'Organization Information',
    businessLicense: 'Business License',

    // Notification Settings
    emailNotifications: 'Email Notifications',
    smsNotifications: 'SMS Notifications',
    newBookings: 'New Bookings',
    getNotifiedNewBooking: 'Get notified when someone books your event',
    cancellations: 'Cancellations',
    getNotifiedCancellations: 'Get notified when bookings are cancelled',
    lowInventoryNotifications: 'Low Inventory Notifications',
    dailyReports: 'Daily Reports',
    receiveDailySummary: 'Receive daily summary of bookings and revenue',
    weeklyReports: 'Weekly Reports',
    receiveWeeklyAnalytics: 'Receive weekly analytics and insights',
    monthlyReports: 'Monthly Reports',

    // Security Settings
    securitySettings: 'Security Settings',
    twoFactorAuthentication: 'Two-Factor Authentication',
    addExtraLayerSecurity: 'Add an extra layer of security to your account',
    loginNotifications: 'Login Notifications',
    getNotifiedNewLogins: 'Get notified of new login attempts',
    sessionTimeout: 'Session Timeout',
    sessionTimeoutMinutes: 'Session Timeout (minutes)',

    // Password Settings
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    minimumCharacters: 'Minimum 6 characters',
    passwordsDoNotMatch: 'New passwords do not match',
    passwordTooShort: 'New password must be at least 6 characters long',
    changingPassword: 'Changing Password...',
    passwordChanged: 'Password Changed Successfully',

    // Event Default Settings
    eventDefaults: 'Event Defaults',
    defaultEventDuration: 'Default Event Duration',
    defaultEventDurationMinutes: 'Default Event Duration (minutes)',
    ticketSaleStart: 'Ticket Sale Start',
    ticketSaleStartDays: 'Ticket Sale Start (days before event)',
    defaultRefundPolicy: 'Default Refund Policy',
    requireApproval: 'Require Approval',
    requireApprovalBeforeLive: 'Require approval before events go live',
    autoPublish: 'Auto Publish',
    autoPublishWhenCreated: 'Automatically publish events when created',

    // Language & Region Settings
    languageRegion: 'Language & Region',
    languagePreferences: 'Language preferences and regional formats',
    regionalFormats: 'Regional formats',
    interfaceLanguage: 'Interface Language',
    timeDateFormats: 'Time & Date Formats',
    currencySettings: 'Currency Settings',
    livePreview: 'Live Preview',

    // Time Format Settings
    hour12Format: '12-hour format',
    hour24Format: '24-hour format',

    // Date Format Settings
    dateFormatExample: 'Example: {example}',

    // Display Settings
    displaySettings: 'Display Settings',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    reduceSpacing: 'Reduce spacing between elements',

    // Theme Settings
    themeSettings: 'Theme Settings',
    choosePreferredTheme: 'Choose your preferred interface theme',
    cleanBrightInterface: 'Clean and bright interface',
    easyOnEyes: 'Easy on the eyes',
    followsSystemPreference: 'Follows system preference',
    accentColorSettings: 'Accent Color',
    chooseAccentColor: 'Choose your preferred accent color',

    // Success Messages
    settingsSavedSuccessfully: 'Settings saved successfully!',
    profileUpdatedSuccessfully: 'Profile updated successfully!',
    organizationUpdatedSuccessfully: 'Organization updated successfully!',
    preferencesUpdatedSuccessfully: 'Preferences updated successfully!',

    // Error Messages
    failedToUpdateProfile: 'Failed to update profile',
    failedToUpdateOrganization: 'Failed to update organization',
    failedToUpdatePreferences: 'Failed to update preferences',
    failedToChangePassword: 'Failed to change password',

    // Loading States
    loadingProfile: 'Loading profile...',
    savingChanges: 'Saving changes...',

    // Authentication
    authenticationRequired: 'Authentication Required',
    pleaseLoginToAccess: 'Please log in to access your settings.',
    goToLogin: 'Go to Login',

    // General Settings
    manageAccount: 'Manage your account and event preferences',
    eventPreferences: 'Event preferences',
    saved: 'Saved!',
    saveChanges: 'Save Changes',

    // Verification Status
    emailNotVerified: 'Email address not verified',
    phoneNotVerified: 'Phone number not verified',
    verified: 'Verified',

    // Color Names
    blue: 'Blue',
    purple: 'Purple',
    green: 'Green',
    red: 'Red',
    orange: 'Orange',
    pink: 'Pink',

    // Size Names
    small: 'Small',
    medium: 'Medium',
    large: 'Large',

    eventImages: 'Event Images',
    bannerImage: 'Banner Image',
    bannerImageDescription: 'Large banner image displayed at the top of your event page',
    eventImage: 'Event Image',
    eventImageDescription: 'Main image shown in event listings and cards',
    noBannerImage: 'No banner image uploaded',
    noEventImage: 'No event image uploaded',
    changeBanner: 'Change Banner',
    uploadBanner: 'Upload Banner',
    changeImage: 'Change Image',
    uploadImage: 'Upload Image',
    uploadingImages: 'Uploading images...',
    imageGuidelines: 'Image Guidelines',
    supportedFormats: 'Supported formats',
    maxFileSize: 'Maximum file size',
    bannerRecommended: 'Banner recommended size',
    imageRecommended: 'Image recommended size',
    invalidImageFile: 'Invalid image file',
    imageUploadFailed: 'Image upload failed',
    imageUploadSuccess: 'Image uploaded successfully',
    selectImageFile: 'Select image file',
    imageProcessing: 'Processing image...',
    imagePreview: 'Image preview',
    removeImage: 'Remove image',
    cropImage: 'Crop image',
    rotateImage: 'Rotate image',
    imageQuality: 'Image quality',
    compressImage: 'Compress image',
    dropImageHere: 'Drop image here or click to upload',

    promoCodes: 'Promo Codes',
    createAndManageDiscountCodes: 'Create and manage discount codes for your events',
    createPromoCode: 'Create Promo Code',
    editPromoCode: 'Edit Promo Code',
    promoCodeAnalytics: 'Promo Code Analytics',

    // Stats and metrics
    totalCodes: 'Total Codes',
    activeCodes: 'Active Codes',
    totalUses: 'Total Uses',
    totalSavings: 'Total Savings',
    topPerformingCodes: 'Top Performing Codes',

    // Search and filters
    searchPromoCodes: 'Search promo codes...',
    allStatus: 'All Status',
    allScopes: 'All Scopes',
    organizerWide: 'Organizer-wide',
    eventSpecific: 'Event-specific',
    expired: 'Expired',
    scheduled: 'Scheduled',
    usedUp: 'Used Up',
    invalid: 'Invalid',

    // Table headers
    code: 'Code',
    details: 'Details',
    usage: 'Usage',
    period: 'Period',
    actions: 'Actions',

    // Promo code properties
    formattedValue: 'Discount Value',
    minimumOrderAmount: 'Min Order',
    maximumDiscountAmount: 'Max Discount',
    currentUsage: 'Current Usage',
    maxUsage: 'Max Usage',
    remaining: 'remaining',
    startDate: 'Start Date',
    endDate: 'End Date',
    allEvents: 'All events',

    // Actions and buttons
    copyCode: 'Copy code',
    viewAnalytics: 'View Analytics',
    refresh: 'Refresh',

    // Status messages
    copySuccess: 'Code copied to clipboard',
    deletePromoCodeConfirm: 'Are you sure you want to delete promo code "{code}"? This action cannot be undone.',
    promoCodeDeletedSuccessfully: 'Promo code deleted successfully',
    failedToDeletePromoCode: 'Failed to delete promo code',
    failedToLoadPromoCodes: 'Failed to load promo codes',
    loadingPromoCodes: 'Loading promo codes...',

    // Empty states
    noPromoCodesYet: 'No promo codes yet',
    createFirstPromoCode: 'Create Your First Promo Code',
    createFirstPromoCodeDescription: 'Create your first promo code to start offering discounts',
    noPromoCodesMatchFilters: 'No promo codes match your filters',
    adjustSearchOrFilterCriteria: 'Try adjusting your search or filter criteria',

    // Scope indicators
    eventSpecificDescription: 'Event-specific',
    organizerWideDescription: 'All events',

    // Usage indicators
    uses: 'uses',

    // Date formatting
    start: 'Start',
    end: 'End',

    // Performance section
    topPerformingCodesDescription: 'Your most successful promo codes',
    numberOne: '#1',

    // Analytics related
    viewDetailedAnalytics: 'View detailed analytics',
    promoCodePerformance: 'Promo Code Performance',

    // Form validation and creation
    promoCodeRequired: 'Promo code is required',
    promoCodeFormat: 'Promo code must contain only uppercase letters and numbers',
    discountValueRequired: 'Discount value is required',
    maxUsageRequired: 'Maximum usage is required',
    startDateRequired: 'Start date is required',
    endDateRequired: 'End date is required',
    endDateAfterStartDate: 'End date must be after start date',

    // Type indicators
    percentageOff: '% off',
    fixedAmountOff: '$ off',

    // Create/Edit specific
    basicSettings: 'Basic Settings',
    discountSettings: 'Discount Settings',
    scopeSettings: 'Scope Settings',
    usageSettings: 'Usage Settings',
    advancedSettings: 'Advanced Settings',

    // Success messages
    promoCodeCreatedSuccessfully: 'Promo code created successfully!',
    promoCodeUpdatedSuccessfully: 'Promo code updated successfully!',

    // Error messages
    failedToCreatePromoCode: 'Failed to create promo code',
    failedToUpdatePromoCode: 'Failed to update promo code',
    cannotEditUsedPromoCode: 'Cannot edit promo code that has been used',

    // Analytics specific
    usageByDay: 'Usage by Day',
    usageByEvent: 'Usage by Event',
    conversionRate: 'Conversion Rate',
    averageDiscount: 'Average Discount',
    totalOrderValue: 'Total Order Value',

    // Status descriptions
    activeDescription: 'Currently active and available for use',
    inactiveDescription: 'Deactivated and not available for use',
    expiredDescription: 'Past the end date',
    scheduledDescription: 'Not yet active, starts in the future',

    // Attendee
    noimagesavailable: 'No images available',
    
};

// Spanish translations for settings
const settingsTranslationsEs: SettingsTranslationKeys = {
    // Organization Settings
    organizationInformation: 'Información de la Organización',
    businessLicense: 'Licencia Comercial',

    // Notification Settings
    emailNotifications: 'Notificaciones por Email',
    smsNotifications: 'Notificaciones SMS',
    newBookings: 'Nuevas Reservas',
    getNotifiedNewBooking: 'Recibe notificaciones cuando alguien reserve tu evento',
    cancellations: 'Cancelaciones',
    getNotifiedCancellations: 'Recibe notificaciones cuando se cancelen reservas',
    lowInventoryNotifications: 'Notificaciones de Inventario Bajo',
    dailyReports: 'Reportes Diarios',
    receiveDailySummary: 'Recibe resumen diario de reservas e ingresos',
    weeklyReports: 'Reportes Semanales',
    receiveWeeklyAnalytics: 'Recibe análisis e insights semanales',
    monthlyReports: 'Reportes Mensuales',

    // Security Settings
    securitySettings: 'Configuración de Seguridad',
    twoFactorAuthentication: 'Autenticación de Dos Factores',
    addExtraLayerSecurity: 'Agrega una capa adicional de seguridad a tu cuenta',
    loginNotifications: 'Notificaciones de Inicio de Sesión',
    getNotifiedNewLogins: 'Recibe notificaciones de nuevos intentos de inicio de sesión',
    sessionTimeout: 'Tiempo de Espera de Sesión',
    sessionTimeoutMinutes: 'Tiempo de Espera de Sesión (minutos)',

    // Password Settings
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    minimumCharacters: 'Mínimo 6 caracteres',
    passwordsDoNotMatch: 'Las nuevas contraseñas no coinciden',
    passwordTooShort: 'La nueva contraseña debe tener al menos 6 caracteres',
    changingPassword: 'Cambiando Contraseña...',
    passwordChanged: 'Contraseña Cambiada Exitosamente',

    // Event Default Settings
    eventDefaults: 'Valores Predeterminados de Eventos',
    defaultEventDuration: 'Duración Predeterminada del Evento',
    defaultEventDurationMinutes: 'Duración Predeterminada del Evento (minutos)',
    ticketSaleStart: 'Inicio de Venta de Boletos',
    ticketSaleStartDays: 'Inicio de Venta de Boletos (días antes del evento)',
    defaultRefundPolicy: 'Política de Reembolso Predeterminada',
    requireApproval: 'Requerir Aprobación',
    requireApprovalBeforeLive: 'Requerir aprobación antes de que los eventos salgan en vivo',
    autoPublish: 'Publicación Automática',
    autoPublishWhenCreated: 'Publicar automáticamente los eventos cuando se crean',

    // Language & Region Settings
    languageRegion: 'Idioma y Región',
    languagePreferences: 'Preferencias de idioma y formatos regionales',
    regionalFormats: 'Formatos regionales',
    interfaceLanguage: 'Idioma de la Interfaz',
    timeDateFormats: 'Formatos de Hora y Fecha',
    currencySettings: 'Configuración de Moneda',
    livePreview: 'Vista Previa en Vivo',

    // Time Format Settings
    hour12Format: 'Formato de 12 horas',
    hour24Format: 'Formato de 24 horas',

    // Date Format Settings
    dateFormatExample: 'Ejemplo: {example}',

    // Display Settings
    displaySettings: 'Configuración de Pantalla',
    fontSizeSmall: 'Pequeño',
    fontSizeMedium: 'Mediano',
    fontSizeLarge: 'Grande',
    reduceSpacing: 'Reducir espaciado entre elementos',

    // Theme Settings
    themeSettings: 'Configuración del Tema',
    choosePreferredTheme: 'Elige tu tema de interfaz preferido',
    cleanBrightInterface: 'Interfaz limpia y brillante',
    easyOnEyes: 'Suave para los ojos',
    followsSystemPreference: 'Sigue la preferencia del sistema',
    accentColorSettings: 'Color de Acento',
    chooseAccentColor: 'Elige tu color de acento preferido',

    // Success Messages
    settingsSavedSuccessfully: '¡Configuración guardada exitosamente!',
    profileUpdatedSuccessfully: '¡Perfil actualizado exitosamente!',
    organizationUpdatedSuccessfully: '¡Organización actualizada exitosamente!',
    preferencesUpdatedSuccessfully: '¡Preferencias actualizadas exitosamente!',

    // Error Messages
    failedToUpdateProfile: 'Error al actualizar perfil',
    failedToUpdateOrganization: 'Error al actualizar organización',
    failedToUpdatePreferences: 'Error al actualizar preferencias',
    failedToChangePassword: 'Error al cambiar contraseña',

    // Loading States
    loadingProfile: 'Cargando perfil...',
    savingChanges: 'Guardando cambios...',

    // Authentication
    authenticationRequired: 'Autenticación Requerida',
    pleaseLoginToAccess: 'Por favor inicia sesión para acceder a tu configuración.',
    goToLogin: 'Ir al Login',

    // General Settings
    manageAccount: 'Gestiona tu cuenta y preferencias de eventos',
    eventPreferences: 'Preferencias de eventos',
    saved: '¡Guardado!',
    saveChanges: 'Guardar Cambios',

    // Verification Status
    emailNotVerified: 'Dirección de email no verificada',
    phoneNotVerified: 'Número de teléfono no verificado',
    verified: 'Verificado',

    // Color Names
    blue: 'Azul',
    purple: 'Morado',
    green: 'Verde',
    red: 'Rojo',
    orange: 'Naranja',
    pink: 'Rosa',

    // Size Names
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',

    // Image Management
    eventImages: 'Imágenes del Evento',
    bannerImage: 'Imagen de Banner',
    bannerImageDescription: 'Imagen de banner grande mostrada en la parte superior de tu página de evento',
    eventImage: 'Imagen del Evento',
    eventImageDescription: 'Imagen principal mostrada en listados y tarjetas de eventos',
    noBannerImage: 'No se ha subido imagen de banner',
    noEventImage: 'No se ha subido imagen del evento',
    changeBanner: 'Cambiar Banner',
    uploadBanner: 'Subir Banner',
    changeImage: 'Cambiar Imagen',
    uploadImage: 'Subir Imagen',
    uploadingImages: 'Subiendo imágenes...',
    imageGuidelines: 'Directrices de Imagen',
    supportedFormats: 'Formatos soportados',
    maxFileSize: 'Tamaño máximo de archivo',
    bannerRecommended: 'Tamaño recomendado del banner',
    imageRecommended: 'Tamaño recomendado de imagen',
    invalidImageFile: 'Archivo de imagen inválido',
    imageUploadFailed: 'Error al subir imagen',
    imageUploadSuccess: 'Imagen subida exitosamente',
    selectImageFile: 'Seleccionar archivo de imagen',
    imageProcessing: 'Procesando imagen...',
    imagePreview: 'Vista previa de imagen',
    removeImage: 'Eliminar imagen',
    cropImage: 'Recortar imagen',
    rotateImage: 'Rotar imagen',
    imageQuality: 'Calidad de imagen',
    compressImage: 'Comprimir imagen',
    dropImageHere: 'Suelta la imagen aquí o haz clic para subir',


    // Page headers and navigation
    promoCodes: 'Códigos Promocionales',
    createAndManageDiscountCodes: 'Crea y gestiona códigos de descuento para tus eventos',
    createPromoCode: 'Crear Código Promocional',
    editPromoCode: 'Editar Código Promocional',
    promoCodeAnalytics: 'Analíticas de Código Promocional',

    // Stats and metrics
    totalCodes: 'Códigos Totales',
    activeCodes: 'Códigos Activos',
    totalUses: 'Usos Totales',
    totalSavings: 'Ahorros Totales',
    topPerformingCodes: 'Códigos Más Exitosos',

    // Search and filters
    searchPromoCodes: 'Buscar códigos promocionales...',
    allStatus: 'Todos los Estados',
    allScopes: 'Todos los Alcances',
    organizerWide: 'Todo el organizador',
    eventSpecific: 'Evento específico',
    expired: 'Expirado',
    scheduled: 'Programado',
    usedUp: 'Agotado',
    invalid: 'Inválido',

    // Table headers
    code: 'Código',
    details: 'Detalles',
    usage: 'Uso',
    period: 'Período',
    actions: 'Acciones',

    // Promo code properties
    formattedValue: 'Valor del Descuento',
    minimumOrderAmount: 'Pedido Mín.',
    maximumDiscountAmount: 'Descuento Máx.',
    currentUsage: 'Uso Actual',
    maxUsage: 'Uso Máximo',
    remaining: 'restantes',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    allEvents: 'Todos los eventos',

    // Actions and buttons
    copyCode: 'Copiar código',
    viewAnalytics: 'Ver Analíticas',
    refresh: 'Actualizar',

    // Status messages
    copySuccess: 'Código copiado al portapapeles',
    deletePromoCodeConfirm: '¿Estás seguro de que quieres eliminar el código promocional "{code}"? Esta acción no se puede deshacer.',
    promoCodeDeletedSuccessfully: 'Código promocional eliminado exitosamente',
    failedToDeletePromoCode: 'Error al eliminar el código promocional',
    failedToLoadPromoCodes: 'Error al cargar los códigos promocionales',
    loadingPromoCodes: 'Cargando códigos promocionales...',

    // Empty states
    noPromoCodesYet: 'Aún no hay códigos promocionales',
    createFirstPromoCode: 'Crea Tu Primer Código Promocional',
    createFirstPromoCodeDescription: 'Crea tu primer código promocional para comenzar a ofrecer descuentos',
    noPromoCodesMatchFilters: 'Ningún código promocional coincide con tus filtros',
    adjustSearchOrFilterCriteria: 'Intenta ajustar tu búsqueda o criterios de filtro',

    // Scope indicators
    eventSpecificDescription: 'Evento específico',
    organizerWideDescription: 'Todos los eventos',

    // Usage indicators
    uses: 'usos',

    // Date formatting
    start: 'Inicio',
    end: 'Fin',

    // Performance section
    topPerformingCodesDescription: 'Tus códigos promocionales más exitosos',
    numberOne: '#1',

    // Analytics related
    viewDetailedAnalytics: 'Ver analíticas detalladas',
    promoCodePerformance: 'Rendimiento del Código Promocional',

    // Form validation and creation
    promoCodeRequired: 'El código promocional es obligatorio',
    promoCodeFormat: 'El código promocional debe contener solo letras mayúsculas y números',
    discountValueRequired: 'El valor del descuento es obligatorio',
    maxUsageRequired: 'El uso máximo es obligatorio',
    startDateRequired: 'La fecha de inicio es obligatoria',
    endDateRequired: 'La fecha de fin es obligatoria',
    endDateAfterStartDate: 'La fecha de fin debe ser posterior a la fecha de inicio',

    // Type indicators
    percentageOff: '% de descuento',
    fixedAmountOff: '$ de descuento',

    // Create/Edit specific
    basicSettings: 'Configuración Básica',
    discountSettings: 'Configuración de Descuento',
    scopeSettings: 'Configuración de Alcance',
    usageSettings: 'Configuración de Uso',
    advancedSettings: 'Configuración Avanzada',

    // Success messages
    promoCodeCreatedSuccessfully: '¡Código promocional creado exitosamente!',
    promoCodeUpdatedSuccessfully: '¡Código promocional actualizado exitosamente!',

    // Error messages
    failedToCreatePromoCode: 'Error al crear el código promocional',
    failedToUpdatePromoCode: 'Error al actualizar el código promocional',
    cannotEditUsedPromoCode: 'No se puede editar un código promocional que ha sido usado',

    // Analytics specific
    usageByDay: 'Uso por Día',
    usageByEvent: 'Uso por Evento',
    conversionRate: 'Tasa de Conversión',
    averageDiscount: 'Descuento Promedio',
    totalOrderValue: 'Valor Total del Pedido',

    // Status descriptions
    activeDescription: 'Actualmente activo y disponible para usar',
    inactiveDescription: 'Desactivado y no disponible para usar',
    expiredDescription: 'Pasada la fecha de fin',
    scheduledDescription: 'Aún no activo, comienza en el futuro',

    // Attendee
    noimagesavailable: 'No hay imágenes disponibles',
    
};

// French translations for settings
const settingsTranslationsFr: SettingsTranslationKeys = {
    // Organization Settings
    organizationInformation: 'Informations de l\'Organisation',
    businessLicense: 'Licence Commerciale',

    // Notification Settings
    emailNotifications: 'Notifications Email',
    smsNotifications: 'Notifications SMS',
    newBookings: 'Nouvelles Réservations',
    getNotifiedNewBooking: 'Soyez notifié quand quelqu\'un réserve votre événement',
    cancellations: 'Annulations',
    getNotifiedCancellations: 'Soyez notifié quand des réservations sont annulées',
    lowInventoryNotifications: 'Notifications de Stock Faible',
    dailyReports: 'Rapports Quotidiens',
    receiveDailySummary: 'Recevez un résumé quotidien des réservations et revenus',
    weeklyReports: 'Rapports Hebdomadaires',
    receiveWeeklyAnalytics: 'Recevez des analyses et insights hebdomadaires',
    monthlyReports: 'Rapports Mensuels',

    // Security Settings
    securitySettings: 'Paramètres de Sécurité',
    twoFactorAuthentication: 'Authentification à Deux Facteurs',
    addExtraLayerSecurity: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
    loginNotifications: 'Notifications de Connexion',
    getNotifiedNewLogins: 'Soyez notifié des nouvelles tentatives de connexion',
    sessionTimeout: 'Délai d\'Expiration de Session',
    sessionTimeoutMinutes: 'Délai d\'Expiration de Session (minutes)',

    // Password Settings
    changePassword: 'Changer le Mot de Passe',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmNewPassword: 'Confirmer le Nouveau Mot de Passe',
    minimumCharacters: 'Minimum 6 caractères',
    passwordsDoNotMatch: 'Les nouveaux mots de passe ne correspondent pas',
    passwordTooShort: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
    changingPassword: 'Changement du Mot de Passe...',
    passwordChanged: 'Mot de Passe Changé avec Succès',

    // Event Default Settings
    eventDefaults: 'Paramètres par Défaut des Événements',
    defaultEventDuration: 'Durée par Défaut de l\'Événement',
    defaultEventDurationMinutes: 'Durée par Défaut de l\'Événement (minutes)',
    ticketSaleStart: 'Début des Ventes de Billets',
    ticketSaleStartDays: 'Début des Ventes de Billets (jours avant l\'événement)',
    defaultRefundPolicy: 'Politique de Remboursement par Défaut',
    requireApproval: 'Exiger une Approbation',
    requireApprovalBeforeLive: 'Exiger une approbation avant que les événements soient en direct',
    autoPublish: 'Publication Automatique',
    autoPublishWhenCreated: 'Publier automatiquement les événements lors de leur création',

    // Language & Region Settings
    languageRegion: 'Langue et Région',
    languagePreferences: 'Préférences linguistiques et formats régionaux',
    regionalFormats: 'Formats régionaux',
    interfaceLanguage: 'Langue de l\'Interface',
    timeDateFormats: 'Formats d\'Heure et de Date',
    currencySettings: 'Paramètres de Devise',
    livePreview: 'Aperçu en Direct',

    // Time Format Settings
    hour12Format: 'Format 12 heures',
    hour24Format: 'Format 24 heures',

    // Date Format Settings
    dateFormatExample: 'Exemple: {example}',

    // Display Settings
    displaySettings: 'Paramètres d\'Affichage',
    fontSizeSmall: 'Petit',
    fontSizeMedium: 'Moyen',
    fontSizeLarge: 'Grand',
    reduceSpacing: 'Réduire l\'espacement entre les éléments',

    // Theme Settings
    themeSettings: 'Paramètres du Thème',
    choosePreferredTheme: 'Choisissez votre thème d\'interface préféré',
    cleanBrightInterface: 'Interface propre et lumineuse',
    easyOnEyes: 'Reposant pour les yeux',
    followsSystemPreference: 'Suit la préférence du système',
    accentColorSettings: 'Couleur d\'Accent',
    chooseAccentColor: 'Choisissez votre couleur d\'accent préférée',

    // Success Messages
    settingsSavedSuccessfully: 'Paramètres sauvegardés avec succès !',
    profileUpdatedSuccessfully: 'Profil mis à jour avec succès !',
    organizationUpdatedSuccessfully: 'Organisation mise à jour avec succès !',
    preferencesUpdatedSuccessfully: 'Préférences mises à jour avec succès !',

    // Error Messages
    failedToUpdateProfile: 'Échec de la mise à jour du profil',
    failedToUpdateOrganization: 'Échec de la mise à jour de l\'organisation',
    failedToUpdatePreferences: 'Échec de la mise à jour des préférences',
    failedToChangePassword: 'Échec du changement de mot de passe',

    // Loading States
    loadingProfile: 'Chargement du profil...',
    savingChanges: 'Sauvegarde des modifications...',

    // Authentication
    authenticationRequired: 'Authentification Requise',
    pleaseLoginToAccess: 'Veuillez vous connecter pour accéder à vos paramètres.',
    goToLogin: 'Aller à la Connexion',

    // General Settings
    manageAccount: 'Gérez votre compte et les préférences d\'événements',
    eventPreferences: 'Préférences d\'événements',
    saved: 'Sauvegardé !',
    saveChanges: 'Sauvegarder les Modifications',

    // Verification Status
    emailNotVerified: 'Adresse email non vérifiée',
    phoneNotVerified: 'Numéro de téléphone non vérifié',
    verified: 'Vérifié',

    // Color Names
    blue: 'Bleu',
    purple: 'Violet',
    green: 'Vert',
    red: 'Rouge',
    orange: 'Orange',
    pink: 'Rose',

    // Size Names
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    // Image Management
    eventImages: 'Images de l\'Événement',
    bannerImage: 'Image de Bannière',
    bannerImageDescription: 'Grande image de bannière affichée en haut de votre page d\'événement',
    eventImage: 'Image de l\'Événement',
    eventImageDescription: 'Image principale affichée dans les listes et cartes d\'événements',
    noBannerImage: 'Aucune image de bannière téléchargée',
    noEventImage: 'Aucune image d\'événement téléchargée',
    changeBanner: 'Changer la Bannière',
    uploadBanner: 'Télécharger la Bannière',
    changeImage: 'Changer l\'Image',
    uploadImage: 'Télécharger l\'Image',
    uploadingImages: 'Téléchargement des images...',
    imageGuidelines: 'Directives d\'Image',
    supportedFormats: 'Formats supportés',
    maxFileSize: 'Taille maximale du fichier',
    bannerRecommended: 'Taille recommandée de la bannière',
    imageRecommended: 'Taille recommandée de l\'image',
    invalidImageFile: 'Fichier image invalide',
    imageUploadFailed: 'Échec du téléchargement de l\'image',
    imageUploadSuccess: 'Image téléchargée avec succès',
    selectImageFile: 'Sélectionner un fichier image',
    imageProcessing: 'Traitement de l\'image...',
    imagePreview: 'Aperçu de l\'image',
    removeImage: 'Supprimer l\'image',
    cropImage: 'Recadrer l\'image',
    rotateImage: 'Faire pivoter l\'image',
    imageQuality: 'Qualité de l\'image',
    compressImage: 'Compresser l\'image',
    dropImageHere: 'Déposez l\'image ici ou cliquez pour télécharger',

    // Page headers and navigation
    promoCodes: 'Codes Promo',
    createAndManageDiscountCodes: 'Créez et gérez les codes de réduction pour vos événements',
    createPromoCode: 'Créer un Code Promo',
    editPromoCode: 'Modifier le Code Promo',
    promoCodeAnalytics: 'Analyses du Code Promo',

    // Stats and metrics
    totalCodes: 'Codes Totaux',
    activeCodes: 'Codes Actifs',
    totalUses: 'Utilisations Totales',
    totalSavings: 'Économies Totales',
    topPerformingCodes: 'Codes les Plus Performants',

    // Search and filters
    searchPromoCodes: 'Rechercher des codes promo...',
    allStatus: 'Tous les Statuts',
    allScopes: 'Toutes les Portées',
    organizerWide: 'Organisateur complet',
    eventSpecific: 'Événement spécifique',
    expired: 'Expiré',
    scheduled: 'Programmé',
    usedUp: 'Épuisé',
    invalid: 'Invalide',

    // Table headers
    code: 'Code',
    details: 'Détails',
    usage: 'Utilisation',
    period: 'Période',
    actions: 'Actions',

    // Promo code properties
    formattedValue: 'Valeur de Réduction',
    minimumOrderAmount: 'Commande Min.',
    maximumDiscountAmount: 'Réduction Max.',
    currentUsage: 'Utilisation Actuelle',
    maxUsage: 'Utilisation Maximum',
    remaining: 'restants',
    startDate: 'Date de Début',
    endDate: 'Date de Fin',
    allEvents: 'Tous les événements',

    // Actions and buttons
    copyCode: 'Copier le code',
    viewAnalytics: 'Voir les Analyses',
    refresh: 'Actualiser',

    // Status messages
    copySuccess: 'Code copié dans le presse-papiers',
    deletePromoCodeConfirm: 'Êtes-vous sûr de vouloir supprimer le code promo "{code}" ? Cette action ne peut pas être annulée.',
    promoCodeDeletedSuccessfully: 'Code promo supprimé avec succès',
    failedToDeletePromoCode: 'Échec de la suppression du code promo',
    failedToLoadPromoCodes: 'Échec du chargement des codes promo',
    loadingPromoCodes: 'Chargement des codes promo...',

    // Empty states
    noPromoCodesYet: 'Aucun code promo encore',
    createFirstPromoCode: 'Créez Votre Premier Code Promo',
    createFirstPromoCodeDescription: 'Créez votre premier code promo pour commencer à offrir des réductions',
    noPromoCodesMatchFilters: 'Aucun code promo ne correspond à vos filtres',
    adjustSearchOrFilterCriteria: 'Essayez d\'ajuster vos critères de recherche ou de filtre',

    // Scope indicators
    eventSpecificDescription: 'Événement spécifique',
    organizerWideDescription: 'Tous les événements',

    // Usage indicators
    uses: 'utilisations',

    // Date formatting
    start: 'Début',
    end: 'Fin',

    // Performance section
    topPerformingCodesDescription: 'Vos codes promo les plus performants',
    numberOne: '#1',

    // Analytics related
    viewDetailedAnalytics: 'Voir les analyses détaillées',
    promoCodePerformance: 'Performance du Code Promo',

    // Form validation and creation
    promoCodeRequired: 'Le code promo est requis',
    promoCodeFormat: 'Le code promo ne doit contenir que des lettres majuscules et des chiffres',
    discountValueRequired: 'La valeur de réduction est requise',
    maxUsageRequired: 'L\'utilisation maximum est requise',
    startDateRequired: 'La date de début est requise',
    endDateRequired: 'La date de fin est requise',
    endDateAfterStartDate: 'La date de fin doit être postérieure à la date de début',

    // Type indicators
    percentageOff: '% de réduction',
    fixedAmountOff: '$ de réduction',

    // Create/Edit specific
    basicSettings: 'Paramètres de Base',
    discountSettings: 'Paramètres de Réduction',
    scopeSettings: 'Paramètres de Portée',
    usageSettings: 'Paramètres d\'Utilisation',
    advancedSettings: 'Paramètres Avancés',

    // Success messages
    promoCodeCreatedSuccessfully: 'Code promo créé avec succès !',
    promoCodeUpdatedSuccessfully: 'Code promo mis à jour avec succès !',

    // Error messages
    failedToCreatePromoCode: 'Échec de la création du code promo',
    failedToUpdatePromoCode: 'Échec de la mise à jour du code promo',
    cannotEditUsedPromoCode: 'Impossible de modifier un code promo qui a été utilisé',

    // Analytics specific
    usageByDay: 'Utilisation par Jour',
    usageByEvent: 'Utilisation par Événement',
    conversionRate: 'Taux de Conversion',
    averageDiscount: 'Réduction Moyenne',
    totalOrderValue: 'Valeur Totale de la Commande',

    // Status descriptions
    activeDescription: 'Actuellement actif et disponible',
    inactiveDescription: 'Désactivé et non disponible',
    expiredDescription: 'Passé la date de fin',
    scheduledDescription: 'Pas encore actif, commence dans le futur',

    // Attendee
    noimagesavailable: 'Aucune image disponible',
    
};

// German translations for settings
const settingsTranslationsDe: SettingsTranslationKeys = {
    // Organization Settings
    organizationInformation: 'Organisationsinformationen',
    businessLicense: 'Gewerbeschein',

    // Notification Settings
    emailNotifications: 'E-Mail-Benachrichtigungen',
    smsNotifications: 'SMS-Benachrichtigungen',
    newBookings: 'Neue Buchungen',
    getNotifiedNewBooking: 'Benachrichtigung erhalten, wenn jemand Ihr Event bucht',
    cancellations: 'Stornierungen',
    getNotifiedCancellations: 'Benachrichtigung erhalten, wenn Buchungen storniert werden',
    lowInventoryNotifications: 'Benachrichtigungen bei niedrigem Bestand',
    dailyReports: 'Tägliche Berichte',
    receiveDailySummary: 'Tägliche Zusammenfassung von Buchungen und Einnahmen erhalten',
    weeklyReports: 'Wöchentliche Berichte',
    receiveWeeklyAnalytics: 'Wöchentliche Analysen und Einblicke erhalten',
    monthlyReports: 'Monatliche Berichte',

    // Security Settings
    securitySettings: 'Sicherheitseinstellungen',
    twoFactorAuthentication: 'Zwei-Faktor-Authentifizierung',
    addExtraLayerSecurity: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
    loginNotifications: 'Anmelde-Benachrichtigungen',
    getNotifiedNewLogins: 'Benachrichtigung über neue Anmeldeversuche erhalten',
    sessionTimeout: 'Sitzungs-Timeout',
    sessionTimeoutMinutes: 'Sitzungs-Timeout (Minuten)',

    // Password Settings
    changePassword: 'Passwort Ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmNewPassword: 'Neues Passwort Bestätigen',
    minimumCharacters: 'Mindestens 6 Zeichen',
    passwordsDoNotMatch: 'Die neuen Passwörter stimmen nicht überein',
    passwordTooShort: 'Das neue Passwort muss mindestens 6 Zeichen lang sein',
    changingPassword: 'Passwort wird geändert...',
    passwordChanged: 'Passwort erfolgreich geändert',

    // Event Default Settings
    eventDefaults: 'Event-Standardeinstellungen',
    defaultEventDuration: 'Standard-Event-Dauer',
    defaultEventDurationMinutes: 'Standard-Event-Dauer (Minuten)',
    ticketSaleStart: 'Ticketverkauf-Beginn',
    ticketSaleStartDays: 'Ticketverkauf-Beginn (Tage vor dem Event)',
    defaultRefundPolicy: 'Standard-Rückerstattungsrichtlinie',
    requireApproval: 'Genehmigung Erforderlich',
    requireApprovalBeforeLive: 'Genehmigung erforderlich, bevor Events live gehen',
    autoPublish: 'Auto-Veröffentlichung',
    autoPublishWhenCreated: 'Events automatisch veröffentlichen, wenn sie erstellt werden',

    // Language & Region Settings
    languageRegion: 'Sprache & Region',
    languagePreferences: 'Spracheinstellungen und regionale Formate',
    regionalFormats: 'Regionale Formate',
    interfaceLanguage: 'Interface-Sprache',
    timeDateFormats: 'Zeit- und Datumsformate',
    currencySettings: 'Währungseinstellungen',
    livePreview: 'Live-Vorschau',

    // Time Format Settings
    hour12Format: '12-Stunden-Format',
    hour24Format: '24-Stunden-Format',

    // Date Format Settings
    dateFormatExample: 'Beispiel: {example}',

    // Display Settings
    displaySettings: 'Anzeigeeinstellungen',
    fontSizeSmall: 'Klein',
    fontSizeMedium: 'Mittel',
    fontSizeLarge: 'Groß',
    reduceSpacing: 'Abstände zwischen Elementen reduzieren',

    // Theme Settings
    themeSettings: 'Theme-Einstellungen',
    choosePreferredTheme: 'Wählen Sie Ihr bevorzugtes Interface-Theme',
    cleanBrightInterface: 'Saubere und helle Benutzeroberfläche',
    easyOnEyes: 'Augenschonend',
    followsSystemPreference: 'Folgt der Systemeinstellung',
    accentColorSettings: 'Akzentfarbe',
    chooseAccentColor: 'Wählen Sie Ihre bevorzugte Akzentfarbe',

    // Success Messages
    settingsSavedSuccessfully: 'Einstellungen erfolgreich gespeichert!',
    profileUpdatedSuccessfully: 'Profil erfolgreich aktualisiert!',
    organizationUpdatedSuccessfully: 'Organisation erfolgreich aktualisiert!',
    preferencesUpdatedSuccessfully: 'Einstellungen erfolgreich aktualisiert!',

    // Error Messages
    failedToUpdateProfile: 'Fehler beim Aktualisieren des Profils',
    failedToUpdateOrganization: 'Fehler beim Aktualisieren der Organisation',
    failedToUpdatePreferences: 'Fehler beim Aktualisieren der Einstellungen',
    failedToChangePassword: 'Fehler beim Ändern des Passworts',

    // Loading States
    loadingProfile: 'Profil wird geladen...',
    savingChanges: 'Änderungen werden gespeichert...',

    // Authentication
    authenticationRequired: 'Authentifizierung Erforderlich',
    pleaseLoginToAccess: 'Bitte melden Sie sich an, um auf Ihre Einstellungen zuzugreifen.',
    goToLogin: 'Zur Anmeldung',

    // General Settings
    manageAccount: 'Verwalten Sie Ihr Konto und Event-Einstellungen',
    eventPreferences: 'Event-Einstellungen',
    saved: 'Gespeichert!',
    saveChanges: 'Änderungen Speichern',

    // Verification Status
    emailNotVerified: 'E-Mail-Adresse nicht verifiziert',
    phoneNotVerified: 'Telefonnummer nicht verifiziert',
    verified: 'Verifiziert',

    // Color Names
    blue: 'Blau',
    purple: 'Lila',
    green: 'Grün',
    red: 'Rot',
    orange: 'Orange',
    pink: 'Rosa',

    // Size Names
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',

    // Image Management
    eventImages: 'Veranstaltungsbilder',
    bannerImage: 'Banner-Bild',
    bannerImageDescription: 'Großes Banner-Bild, das oben auf Ihrer Veranstaltungsseite angezeigt wird',
    eventImage: 'Veranstaltungsbild',
    eventImageDescription: 'Hauptbild, das in Veranstaltungslisten und -karten angezeigt wird',
    noBannerImage: 'Kein Banner-Bild hochgeladen',
    noEventImage: 'Kein Veranstaltungsbild hochgeladen',
    changeBanner: 'Banner Ändern',
    uploadBanner: 'Banner Hochladen',
    changeImage: 'Bild Ändern',
    uploadImage: 'Bild Hochladen',
    uploadingImages: 'Bilder werden hochgeladen...',
    imageGuidelines: 'Bild-Richtlinien',
    supportedFormats: 'Unterstützte Formate',
    maxFileSize: 'Maximale Dateigröße',
    bannerRecommended: 'Empfohlene Banner-Größe',
    imageRecommended: 'Empfohlene Bildgröße',
    invalidImageFile: 'Ungültige Bilddatei',
    imageUploadFailed: 'Bild-Upload fehlgeschlagen',
    imageUploadSuccess: 'Bild erfolgreich hochgeladen',
    selectImageFile: 'Bilddatei auswählen',
    imageProcessing: 'Bild wird verarbeitet...',
    imagePreview: 'Bildvorschau',
    removeImage: 'Bild entfernen',
    cropImage: 'Bild zuschneiden',
    rotateImage: 'Bild drehen',
    imageQuality: 'Bildqualität',
    compressImage: 'Bild komprimieren',
    dropImageHere: 'Bild hier ablegen oder klicken, um hochzuladen',

    // Page headers and navigation
    promoCodes: 'Promo-Codes',
    createAndManageDiscountCodes: 'Erstellen und verwalten Sie Rabattcodes für Ihre Veranstaltungen',
    createPromoCode: 'Promo-Code Erstellen',
    editPromoCode: 'Promo-Code Bearbeiten',
    promoCodeAnalytics: 'Promo-Code Analysen',

    // Stats and metrics
    totalCodes: 'Codes Gesamt',
    activeCodes: 'Aktive Codes',
    totalUses: 'Gesamtnutzungen',
    totalSavings: 'Gesamtersparnis',
    topPerformingCodes: 'Beste Codes',

    // Search and filters
    searchPromoCodes: 'Promo-Codes suchen...',
    allStatus: 'Alle Status',
    allScopes: 'Alle Bereiche',
    organizerWide: 'Organisator-weit',
    eventSpecific: 'Veranstaltungsspezifisch',
    expired: 'Abgelaufen',
    scheduled: 'Geplant',
    usedUp: 'Aufgebraucht',
    invalid: 'Ungültig',

    // Table headers
    code: 'Code',
    details: 'Details',
    usage: 'Nutzung',
    period: 'Zeitraum',
    actions: 'Aktionen',

    // Promo code properties
    formattedValue: 'Rabattwert',
    minimumOrderAmount: 'Min. Bestellung',
    maximumDiscountAmount: 'Max. Rabatt',
    currentUsage: 'Aktuelle Nutzung',
    maxUsage: 'Max. Nutzung',
    remaining: 'verbleibend',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    allEvents: 'Alle Veranstaltungen',

    // Actions and buttons
    copyCode: 'Code kopieren',
    viewAnalytics: 'Analysen Anzeigen',
    refresh: 'Aktualisieren',

    // Status messages
    copySuccess: 'Code in Zwischenablage kopiert',
    deletePromoCodeConfirm: 'Sind Sie sicher, dass Sie den Promo-Code "{code}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    promoCodeDeletedSuccessfully: 'Promo-Code erfolgreich gelöscht',
    failedToDeletePromoCode: 'Fehler beim Löschen des Promo-Codes',
    failedToLoadPromoCodes: 'Fehler beim Laden der Promo-Codes',
    loadingPromoCodes: 'Promo-Codes werden geladen...',

    // Empty states
    noPromoCodesYet: 'Noch keine Promo-Codes',
    createFirstPromoCode: 'Erstellen Sie Ihren Ersten Promo-Code',
    createFirstPromoCodeDescription: 'Erstellen Sie Ihren ersten Promo-Code, um Rabatte anzubieten',
    noPromoCodesMatchFilters: 'Keine Promo-Codes entsprechen Ihren Filtern',
    adjustSearchOrFilterCriteria: 'Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen',

    // Scope indicators
    eventSpecificDescription: 'Veranstaltungsspezifisch',
    organizerWideDescription: 'Alle Veranstaltungen',

    // Usage indicators
    uses: 'Nutzungen',

    // Date formatting
    start: 'Start',
    end: 'Ende',

    // Performance section
    topPerformingCodesDescription: 'Ihre erfolgreichsten Promo-Codes',
    numberOne: '#1',

    // Analytics related
    viewDetailedAnalytics: 'Detaillierte Analysen anzeigen',
    promoCodePerformance: 'Promo-Code Leistung',

    // Form validation and creation
    promoCodeRequired: 'Promo-Code ist erforderlich',
    promoCodeFormat: 'Promo-Code darf nur Großbuchstaben und Zahlen enthalten',
    discountValueRequired: 'Rabattwert ist erforderlich',
    maxUsageRequired: 'Maximale Nutzung ist erforderlich',
    startDateRequired: 'Startdatum ist erforderlich',
    endDateRequired: 'Enddatum ist erforderlich',
    endDateAfterStartDate: 'Enddatum muss nach dem Startdatum liegen',

    // Type indicators
    percentageOff: '% Rabatt',
    fixedAmountOff: '$ Rabatt',

    // Create/Edit specific
    basicSettings: 'Grundeinstellungen',
    discountSettings: 'Rabatteinstellungen',
    scopeSettings: 'Bereichseinstellungen',
    usageSettings: 'Nutzungseinstellungen',
    advancedSettings: 'Erweiterte Einstellungen',

    // Success messages
    promoCodeCreatedSuccessfully: 'Promo-Code erfolgreich erstellt!',
    promoCodeUpdatedSuccessfully: 'Promo-Code erfolgreich aktualisiert!',

    // Error messages
    failedToCreatePromoCode: 'Fehler beim Erstellen des Promo-Codes',
    failedToUpdatePromoCode: 'Fehler beim Aktualisieren des Promo-Codes',
    cannotEditUsedPromoCode: 'Bereits verwendeter Promo-Code kann nicht bearbeitet werden',

    // Analytics specific
    usageByDay: 'Nutzung pro Tag',
    usageByEvent: 'Nutzung pro Veranstaltung',
    conversionRate: 'Konversionsrate',
    averageDiscount: 'Durchschnittlicher Rabatt',
    totalOrderValue: 'Gesamtbestellwert',

    // Status descriptions
    activeDescription: 'Derzeit aktiv und verfügbar',
    inactiveDescription: 'Deaktiviert und nicht verfügbar',
    expiredDescription: 'Nach dem Enddatum',
    scheduledDescription: 'Noch nicht aktiv, startet in der Zukunft',

    // Attendee
    noimagesavailable: 'Keine Bilder verfügbar',
    
};

// Italian translations for settings
const settingsTranslationsIt: SettingsTranslationKeys = {
    // Organization Settings
    organizationInformation: 'Informazioni Organizzazione',
    businessLicense: 'Licenza Commerciale',

    // Notification Settings
    emailNotifications: 'Notifiche Email',
    smsNotifications: 'Notifiche SMS',
    newBookings: 'Nuove Prenotazioni',
    getNotifiedNewBooking: 'Ricevi notifiche quando qualcuno prenota il tuo evento',
    cancellations: 'Cancellazioni',
    getNotifiedCancellations: 'Ricevi notifiche quando le prenotazioni vengono cancellate',
    lowInventoryNotifications: 'Notifiche Scorte Basse',
    dailyReports: 'Report Giornalieri',
    receiveDailySummary: 'Ricevi riassunto giornaliero di prenotazioni e ricavi',
    weeklyReports: 'Report Settimanali',
    receiveWeeklyAnalytics: 'Ricevi analisi e approfondimenti settimanali',
    monthlyReports: 'Report Mensili',

    // Security Settings
    securitySettings: 'Impostazioni di Sicurezza',
    twoFactorAuthentication: 'Autenticazione a Due Fattori',
    addExtraLayerSecurity: 'Aggiungi un livello extra di sicurezza al tuo account',
    loginNotifications: 'Notifiche di Accesso',
    getNotifiedNewLogins: 'Ricevi notifiche di nuovi tentativi di accesso',
    sessionTimeout: 'Timeout Sessione',
    sessionTimeoutMinutes: 'Timeout Sessione (minuti)',

    // Password Settings
    changePassword: 'Cambia Password',
    currentPassword: 'Password Attuale',
    newPassword: 'Nuova Password',
    confirmNewPassword: 'Conferma Nuova Password',
    minimumCharacters: 'Minimo 6 caratteri',
    passwordsDoNotMatch: 'Le nuove password non corrispondono',
    passwordTooShort: 'La nuova password deve essere di almeno 6 caratteri',
    changingPassword: 'Cambio Password...',
    passwordChanged: 'Password Cambiata con Successo',

    // Event Default Settings
    eventDefaults: 'Impostazioni Predefinite Eventi',
    defaultEventDuration: 'Durata Predefinita Evento',
    defaultEventDurationMinutes: 'Durata Predefinita Evento (minuti)',
    ticketSaleStart: 'Inizio Vendita Biglietti',
    ticketSaleStartDays: 'Inizio Vendita Biglietti (giorni prima dell\'evento)',
    defaultRefundPolicy: 'Politica di Rimborso Predefinita',
    requireApproval: 'Richiedi Approvazione',
    requireApprovalBeforeLive: 'Richiedi approvazione prima che gli eventi vadano in diretta',
    autoPublish: 'Pubblicazione Automatica',
    autoPublishWhenCreated: 'Pubblica automaticamente gli eventi quando vengono creati',

    // Language & Region Settings
    languageRegion: 'Lingua e Regione',
    languagePreferences: 'Preferenze linguistiche e formati regionali',
    regionalFormats: 'Formati regionali',
    interfaceLanguage: 'Lingua dell\'Interfaccia',
    timeDateFormats: 'Formati Ora e Data',
    currencySettings: 'Impostazioni Valuta',
    livePreview: 'Anteprima dal Vivo',

    // Time Format Settings
    hour12Format: 'Formato 12 ore',
    hour24Format: 'Formato 24 ore',

    // Date Format Settings
    dateFormatExample: 'Esempio: {example}',

    // Display Settings
    displaySettings: 'Impostazioni Display',
    fontSizeSmall: 'Piccolo',
    fontSizeMedium: 'Medio',
    fontSizeLarge: 'Grande',
    reduceSpacing: 'Riduci spaziatura tra elementi',

    // Theme Settings
    themeSettings: 'Impostazioni Tema',
    choosePreferredTheme: 'Scegli il tuo tema di interfaccia preferito',
    cleanBrightInterface: 'Interfaccia pulita e luminosa',
    easyOnEyes: 'Facile per gli occhi',
    followsSystemPreference: 'Segue la preferenza del sistema',
    accentColorSettings: 'Colore di Accento',
    chooseAccentColor: 'Scegli il tuo colore di accento preferito',

    // Success Messages
    settingsSavedSuccessfully: 'Impostazioni salvate con successo!',
    profileUpdatedSuccessfully: 'Profilo aggiornato con successo!',
    organizationUpdatedSuccessfully: 'Organizzazione aggiornata con successo!',
    preferencesUpdatedSuccessfully: 'Preferenze aggiornate con successo!',

    // Error Messages
    failedToUpdateProfile: 'Impossibile aggiornare il profilo',
    failedToUpdateOrganization: 'Impossibile aggiornare l\'organizzazione',
    failedToUpdatePreferences: 'Impossibile aggiornare le preferenze',
    failedToChangePassword: 'Impossibile cambiare la password',

    // Loading States
    loadingProfile: 'Caricamento profilo...',
    savingChanges: 'Salvataggio modifiche...',

    // Authentication
    authenticationRequired: 'Autenticazione Richiesta',
    pleaseLoginToAccess: 'Accedi per accedere alle tue impostazioni.',
    goToLogin: 'Vai al Login',

    // General Settings
    manageAccount: 'Gestisci il tuo account e le preferenze degli eventi',
    eventPreferences: 'Preferenze eventi',
    saved: 'Salvato!',
    saveChanges: 'Salva Modifiche',

    // Verification Status
    emailNotVerified: 'Indirizzo email non verificato',
    phoneNotVerified: 'Numero di telefono non verificato',
    verified: 'Verificato',

    // Color Names
    blue: 'Blu',
    purple: 'Viola',
    green: 'Verde',
    red: 'Rosso',
    orange: 'Arancione',
    pink: 'Rosa',

    // Size Names
    small: 'Piccolo',
    medium: 'Medio',
    large: 'Grande',

    // Image Management
    eventImages: 'Immagini dell\'Evento',
    bannerImage: 'Immagine Banner',
    bannerImageDescription: 'Grande immagine banner visualizzata in cima alla pagina del tuo evento',
    eventImage: 'Immagine Evento',
    eventImageDescription: 'Immagine principale mostrata negli elenchi e nelle schede degli eventi',
    noBannerImage: 'Nessuna immagine banner caricata',
    noEventImage: 'Nessuna immagine evento caricata',
    changeBanner: 'Cambia Banner',
    uploadBanner: 'Carica Banner',
    changeImage: 'Cambia Immagine',
    uploadImage: 'Carica Immagine',
    uploadingImages: 'Caricamento immagini...',
    imageGuidelines: 'Linee Guida Immagini',
    supportedFormats: 'Formati supportati',
    maxFileSize: 'Dimensione massima file',
    bannerRecommended: 'Dimensione raccomandata banner',
    imageRecommended: 'Dimensione raccomandata immagine',
    invalidImageFile: 'File immagine non valido',
    imageUploadFailed: 'Caricamento immagine fallito',
    imageUploadSuccess: 'Immagine caricata con successo',
    selectImageFile: 'Seleziona file immagine',
    imageProcessing: 'Elaborazione immagine...',
    imagePreview: 'Anteprima immagine',
    removeImage: 'Rimuovi immagine',
    cropImage: 'Ritaglia immagine',
    rotateImage: 'Ruota immagine',
    imageQuality: 'Qualità immagine',
    compressImage: 'Comprimi immagine',
    dropImageHere: 'Trascina l\'immagine qui o clicca per caricare',

    // Page headers and navigation
    promoCodes: 'Codici Promo',
    createAndManageDiscountCodes: 'Crea e gestisci codici sconto per i tuoi eventi',
    createPromoCode: 'Crea Codice Promo',
    editPromoCode: 'Modifica Codice Promo',
    promoCodeAnalytics: 'Analisi Codice Promo',

    // Stats and metrics
    totalCodes: 'Codici Totali',
    activeCodes: 'Codici Attivi',
    totalUses: 'Utilizzi Totali',
    totalSavings: 'Risparmi Totali',
    topPerformingCodes: 'Codici Più Performanti',

    // Search and filters
    searchPromoCodes: 'Cerca codici promo...',
    allStatus: 'Tutti gli Stati',
    allScopes: 'Tutti gli Ambiti',
    organizerWide: 'Organizzatore completo',
    eventSpecific: 'Evento specifico',
    expired: 'Scaduto',
    scheduled: 'Programmato',
    usedUp: 'Esaurito',
    invalid: 'Invalido',

    // Table headers
    code: 'Codice',
    details: 'Dettagli',
    usage: 'Utilizzo',
    period: 'Periodo',
    actions: 'Azioni',

    // Promo code properties
    formattedValue: 'Valore Sconto',
    minimumOrderAmount: 'Ordine Min.',
    maximumDiscountAmount: 'Sconto Max.',
    currentUsage: 'Utilizzo Attuale',
    maxUsage: 'Utilizzo Massimo',
    remaining: 'rimanenti',
    startDate: 'Data di Inizio',
    endDate: 'Data di Fine',
    allEvents: 'Tutti gli eventi',

    // Actions and buttons
    copyCode: 'Copia codice',
    viewAnalytics: 'Visualizza Analisi',
    refresh: 'Aggiorna',

    // Status messages
    copySuccess: 'Codice copiato negli appunti',
    deletePromoCodeConfirm: 'Sei sicuro di voler eliminare il codice promo "{code}"? Questa azione non può essere annullata.',
    promoCodeDeletedSuccessfully: 'Codice promo eliminato con successo',
    failedToDeletePromoCode: 'Impossibile eliminare il codice promo',
    failedToLoadPromoCodes: 'Impossibile caricare i codici promo',
    loadingPromoCodes: 'Caricamento codici promo...',

    // Empty states
    noPromoCodesYet: 'Nessun codice promo ancora',
    createFirstPromoCode: 'Crea il Tuo Primo Codice Promo',
    createFirstPromoCodeDescription: 'Crea il tuo primo codice promo per iniziare a offrire sconti',
    noPromoCodesMatchFilters: 'Nessun codice promo corrisponde ai tuoi filtri',
    adjustSearchOrFilterCriteria: 'Prova ad aggiustare i tuoi criteri di ricerca o filtro',

    // Scope indicators
    eventSpecificDescription: 'Evento specifico',
    organizerWideDescription: 'Tutti gli eventi',

    // Usage indicators
    uses: 'utilizzi',

    // Date formatting
    start: 'Inizio',
    end: 'Fine',

    // Performance section
    topPerformingCodesDescription: 'I tuoi codici promo più performanti',
    numberOne: '#1',

    // Analytics related
    viewDetailedAnalytics: 'Visualizza analisi dettagliate',
    promoCodePerformance: 'Performance Codice Promo',

    // Form validation and creation
    promoCodeRequired: 'Il codice promo è richiesto',
    promoCodeFormat: 'Il codice promo deve contenere solo lettere maiuscole e numeri',
    discountValueRequired: 'Il valore dello sconto è richiesto',
    maxUsageRequired: 'L\'utilizzo massimo è richiesto',
    startDateRequired: 'La data di inizio è richiesta',
    endDateRequired: 'La data di fine è richiesta',
    endDateAfterStartDate: 'La data di fine deve essere dopo la data di inizio',

    // Type indicators
    percentageOff: '% di sconto',
    fixedAmountOff: '$ di sconto',

    // Create/Edit specific
    basicSettings: 'Impostazioni Base',
    discountSettings: 'Impostazioni Sconto',
    scopeSettings: 'Impostazioni Ambito',
    usageSettings: 'Impostazioni Utilizzo',
    advancedSettings: 'Impostazioni Avanzate',

    // Success messages
    promoCodeCreatedSuccessfully: 'Codice promo creato con successo!',
    promoCodeUpdatedSuccessfully: 'Codice promo aggiornato con successo!',

    // Error messages
    failedToCreatePromoCode: 'Impossibile creare il codice promo',
    failedToUpdatePromoCode: 'Impossibile aggiornare il codice promo',
    cannotEditUsedPromoCode: 'Impossibile modificare un codice promo che è stato utilizzato',

    // Analytics specific
    usageByDay: 'Utilizzo per Giorno',
    usageByEvent: 'Utilizzo per Evento',
    conversionRate: 'Tasso di Conversione',
    averageDiscount: 'Sconto Medio',
    totalOrderValue: 'Valore Totale Ordine',

    // Status descriptions
    activeDescription: 'Attualmente attivo e disponibile',
    inactiveDescription: 'Disattivato e non disponibile',
    expiredDescription: 'Oltre la data di fine',
    scheduledDescription: 'Non ancora attivo, inizia nel futuro',

    // Attendee
    noimagesavailable: 'Nessuna immagine disponibile',
    
};



// Helper function for string interpolation
const interpolate = (str: string, params: Record<string, any> = {}): string => {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
    }).replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
    });
};

// Complete translation data for all 5 languages
const translations: Record<string, TranslationKeys> = {
    en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        confirm: 'Confirm',
        back: 'Back',
        create: 'Create',
        update: 'Update',

        // Navigation
        dashboard: 'Dashboard',
        events: 'Events',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',

        // Settings
        personalInformation: 'Personal Information',
        organization: 'Organization',
        notifications: 'Notifications',
        security: 'Security',
        appearance: 'Appearance',
        language: 'Language',
        preferences: 'Preferences',

        // Profile
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phoneNumber: 'Phone Number',
        companyName: 'Company Name',
        address: 'Address',
        city: 'City',
        state: 'State',
        zipCode: 'ZIP Code',
        country: 'Country',

        // Events
        createEvent: 'Create Event',
        editEvent: 'Edit Event',
        eventTitle: 'Event Title',
        eventDescription: 'Event Description',
        eventDate: 'Event Date',
        eventTime: 'Event Time',
        eventLocation: 'Event Location',
        ticketPrice: 'Ticket Price',
        yourEvents: 'Your Events',
        createYourFirstEvent: 'Create Your First Event',
        createFirstEventPrompt: 'Create your first event to get started with EventPro.',
        eventsSubtitle: 'Manage your events and track their performance',
        allEvents: 'All Events',
        unpublished: 'Unpublished',
        searchEvents: 'Search events...',
        noDescriptionAvailable: 'No description available',
        dateNotSet: 'Date not set',
        invalidDate: 'Invalid date',
        timeNotSet: 'Time not set',
        invalidTime: 'Invalid time',
        confirmDeleteEvent: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
        failedToDeleteEvent: 'Failed to delete event',
        failedToTogglePublish: 'Failed to {action} event',
        noEventsMatchSearch: 'No events match your search',
        adjustSearchCriteria: 'Try adjusting your search or filter criteria',

        // Event Form
        createNewEvent: 'Create New Event',
        editEventDetails: 'Edit Event',
        fillEventDetails: 'Fill out the details to create your event',
        updateEventDetails: 'Update your event details',
        basicInformation: 'Basic Information',
        eventTitleRequired: 'Event title is required',
        enterEventTitle: 'Enter event title',
        descriptionRequired: 'Event description is required',
        describeEventDetail: 'Describe your event in detail...',
        categoryRequired: 'Category is required',
        selectCategory: 'Select category',
        maxCapacityRequired: 'Maximum capacity must be greater than 0',
        maximumAttendees: 'Maximum attendees',
        eventImageUrl: 'Event Image URL',
        enterImageUrl: 'https://example.com/event-image.jpg',

        // Date & Time
        dateTime: 'Date & Time',
        multiDayEvent: 'Multi-day event: {count} days',
        dayEvent: '{count} day event',
        startDateTime: 'Start Date & Time',
        startDateTimeRequired: 'Event start date is required',
        endDateTime: 'End Date & Time',
        leaveEmptySingleSession: 'Leave empty for single session events',
        endDateAfterStart: 'End date must be after start date',
        registrationDeadline: 'Registration Deadline',
        whenRegistrationClose: 'When should registration close? (optional)',
        registrationDeadlineBeforeEvent: 'Registration deadline must be before event start',

        // Location
        location: 'Location',
        onlineEvent: 'This is an online event',
        venueRequired: 'Venue is required for in-person events',
        selectVenue: 'Select venue',
        locationDetails: 'Location Details',
        meetingLinkPlatform: 'Meeting link or platform details',
        additionalLocationInfo: 'Additional location information',

        // Ticket Types
        ticketTypes: 'Ticket Types',
        addTicketType: 'Add Ticket Type',
        ticketTypesCount: 'Ticket Types',
        totalTypes: 'Total Types',
        editable: 'Editable',
        locked: 'Locked',
        noTicketTypesYet: 'No ticket types yet',
        addTicketTypesToStart: 'Add ticket types to start selling tickets for your event',
        createFirstTicketType: 'Create First Ticket Type',
        ticketTypeName: 'Ticket Name',
        ticketTypeNameRequired: 'Ticket name is required',
        ticketDescription: 'Description',
        optionalTicketDescription: 'Optional description for this ticket type',
        price: 'Price',
        priceRequired: 'Valid price is required',
        quantity: 'Quantity',
        quantityRequired: 'Ticket quantity must be greater than 0',
        quantityGreaterThanZero: 'Quantity must be greater than 0',
        ticketActive: 'Active (available for purchase)',
        availableForPurchase: 'Available for purchase',
        createTicketType: 'Create Ticket Type',
        updateTicketType: 'Update Ticket Type',
        editTicketType: 'Edit Ticket Type',

        // Smart Editing
        smartTicketEditing: '💡 Smart Ticket Type Editing',
        whenCanEdit: '✅ When you CAN edit:',
        eventDraftStatus: '• Event is in DRAFT status',
        noTicketsSold: '• No tickets sold yet',
        eventNotPublished: '• Event is not published',
        whenEditingLocked: '🔒 When editing is LOCKED:',
        eventIsPublished: '• Event is published',
        ticketsAlreadySold: '• Tickets have already been sold',
        eventStatusNotDraft: '• Event status is not DRAFT',
        safeToEdit: 'Safe to edit - no sales yet',
        lockedToPreserve: 'Locked to preserve sales data',
        ticketsSoldCount: '{count} ticket(s) already sold. Editing is locked to preserve purchase data.',
        cannotCreateTicketTypes: 'Cannot create new ticket types. {count} ticket(s) have already been sold.',
        salesDataIntegrity: 'Event is published. Cannot create ticket types to preserve sales data integrity.',

        // Publishing
        publishingOptions: 'Publishing Options',
        publishEventImmediately: 'Publish event immediately (make it visible to the public)',
        makeVisiblePublic: 'Make it visible to the public',
        publishUnpublishLater: 'You can always publish or unpublish your event later from the dashboard',
        currentlyPublished: 'Currently Published',
        currentlyUnpublished: 'Currently Unpublished',
        usePublishButtons: 'Use the publish/unpublish buttons in the events list to change this status',
        changePublishStatus: 'Change publish status',

        // Validation
        fixErrorsBelow: 'Please fix the errors below',
        formValidationError: 'Please fix form errors',
        requiredField: 'This field is required',
        invalidInput: 'Invalid input',

        // Success/Error Messages
        eventCreatedSuccessfully: 'Event and all ticket types created successfully!',
        eventUpdatedSuccessfully: 'Event updated successfully!',
        ticketTypeCreatedSuccessfully: 'Ticket type created successfully!',
        ticketTypeUpdatedSuccessfully: 'Ticket type updated successfully!',
        failedToCreateEvent: 'Failed to create event. Please try again.',
        failedToUpdateEvent: 'Failed to update event. Please try again.',
        failedToCreateTicketType: 'Failed to create ticket type',
        failedToUpdateTicketType: 'Failed to update ticket type',
        creatingEvent: 'Creating Event...',
        updatingEvent: 'Updating Event...',
        redirectingToDashboard: 'Redirecting to dashboard...',
        redirectingToEventDetail: 'Redirecting to event detail...',

        // Capacity and Venues
        capacity: 'Capacity',
        venue: 'Venue',
        selectAVenue: 'Select a venue',
        venueWithCapacity: '{name} - {city} (Capacity: {capacity})',

        // Categories
        category: 'Category',
        technology: 'Technology',
        business: 'Business',
        music: 'Music',
        sports: 'Sports',
        education: 'Education',

        // Event States
        published: 'Published',
        draft: 'Draft',
        online: 'Online',
        inPerson: 'In-Person',

        // Multi-day
        multiDaySchedule: 'Multi-day schedule',

        // Venue Management
        venues: 'Venues',
        createVenue: 'Create Venue',
        venueName: 'Venue Name',
        venueNameRequired: 'Venue name is required',
        enterVenueName: 'Enter venue name',
        venueAddress: 'Address',
        addressRequired: 'Address is required',
        enterVenueAddress: 'Enter venue address',
        venueState: 'State',
        enterState: 'Enter state',
        enterStateOptional: 'Enter state (optional)',
        venueCountry: 'Country',
        countryRequired: 'Country is required',
        enterCountry: 'Enter country',
        venueZipCode: 'ZIP Code',
        enterZipCode: 'Enter ZIP code',
        enterZipCodeOptional: 'Enter ZIP code (optional)',
        capacityRequired: 'Capacity must be greater than 0',
        maximumCapacity: 'Maximum capacity',
        contactEmail: 'Contact Email',
        contactPhone: 'Contact Phone',
        website: 'Website',
        latitude: 'Latitude',
        longitude: 'Longitude',
        description: 'Description',
        venueDescription: 'Venue Description',
        describeVenue: 'Describe the venue, amenities, special features...',
        venueImageUrl: 'Venue Image URL',
        validEmailRequired: 'Please enter a valid email address',
        latitudeBetween: 'Latitude must be between -90 and 90',
        longitudeBetween: 'Longitude must be between -180 and 180',
        optionalMapIntegration: 'Optional: For map integration',
        createNewVenue: 'Create New Venue',
        venueCreatedSuccessfully: 'Venue created successfully!',
        failedToCreateVenue: 'Failed to create venue. Please try again.',
        failedToFetchVenues: 'Failed to load venues',
        creatingVenue: 'Creating...',
        loadingVenues: 'Loading venues...',
        searchVenues: 'Search venues...',
        allCities: 'All Cities',
        noVenuesFound: 'No venues found',
        adjustFilters: 'Try adjusting your filters',
        getStartedFirstVenue: 'Get started by creating your first venue',
        venueLocation: 'Location',
        venueCapacity: 'Capacity',
        venueEvents: 'Events',
        venueStatus: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        eventsCount: '{count} events',
        viewAvailableVenues: 'View available venues and create new ones',
        createNewOnes: 'Create new ones',

        // Ticket Management
        tickets: 'Tickets',
        ticketManagement: 'Ticket Management',
        manageTicketTypes: 'Manage ticket types, validate tickets, and handle check-ins',
        validateTickets: 'Validate Tickets',
        checkIn: 'Check-in',
        ticketValidation: 'Ticket Validation',
        ticketCheckIn: 'Ticket Check-in',
        ticketsAndCheckIn: 'Tickets & Check-in',

        // Ticket Types Management
        createTicketTypeAction: 'Create Ticket Type',
        ticketTypeLimitations: '⚠️ Important: Ticket Type Creation Limitations',
        publishedEventsRestriction: 'Published events: Ticket types cannot be modified to preserve existing sales data',
        eventsWithSalesRestriction: 'Events with sales: Ticket type editing is locked once tickets are sold',
        draftStatusRequired: 'For ticket type creation: Events must be in DRAFT status with no existing sales',
        alternativeCreateEvent: 'Alternative: Create a new event if you need different ticket types',
        onlyWorksForDraft: 'Only works for draft events with no existing sales',
        createNewEventLink: 'Create New Event',
        manageEventsLink: 'Manage Events',

        // Ticket Form
        selectAnEvent: 'Select an event',
        ticketCreationRequirements: '⚠️ Ticket Creation Requirements',
        eventMustBeDraft: 'Event must be in DRAFT status (not published)',
        noExistingTicketSales: 'Event must have no existing ticket sales',
        mustBeEventOrganizer: 'You must be the event organizer',
        editTicketsDuringCreation: 'If this fails, edit ticket types during event creation instead',
        ticketEvent: 'Event',
        eventRequired: 'Event is required',
        noEventsFound: 'No events found',
        needCreateEventFirst: 'You need to create an event first before creating ticket types.',

        // Ticket Types Display
        loadingTicketTypes: 'Loading ticket types...',
        noTicketTypesFound: 'No ticket types found',
        adjustFiltersOrCreate: 'Try adjusting your filters or create your first ticket type',
        createFirstTicketTypePrompt: 'Create your first ticket type',
        ticketType: 'Ticket Type',
        event: 'Event',
        availability: 'Availability',
        status: 'Status',
        remaining: 'remaining',

        // Validation Tab
        validateTicket: 'Validate Ticket',
        enterTicketNumber: 'Enter ticket number',
        validating: 'Validating...',
        validate: 'Validate',
        validTicket: 'Valid Ticket',
        invalidTicket: 'Invalid Ticket',
        ticketNumber: 'Ticket Number',
        attendeeName: 'Attendee',
        alreadyUsed: 'Already Used',
        notUsed: 'Not Used',

        // Check-in Tab
        checkInTicket: 'Check-in Ticket',
        enterTicketNumberCheckIn: 'Enter ticket number for check-in',
        checkingIn: 'Checking in...',
        ticketCheckedInSuccessfully: 'Ticket Checked In Successfully',

        // Ticket Warnings
        importantTicketLimitations: '⚠️ Important: Ticket Type Creation Limitations',
        cannotModifyPublished: '• Published events: Ticket types cannot be modified to preserve existing sales data',
        editingLockedAfterSales: '• Events with sales: Ticket type editing is locked once tickets are sold',
        draftStatusForCreation: '• For ticket type creation: Events must be in DRAFT status with no existing sales',
        createNewEventAlternative: '• Alternative: Create a new event if you need different ticket types',

        // Business Rules
        businessRulesWarning: '⚠️ Ticket Creation Requirements',

        // Ticket States
        ticketInactive: 'Inactive',

        // General UI
        optional: 'optional',
        required: 'required',

        // Appearance
        theme: 'Theme',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        autoMode: 'Auto Mode',
        accentColor: 'Accent Color',
        fontSize: 'Font Size',
        compactMode: 'Compact Mode',

        // Time and Date
        timeFormat: 'Time Format',
        dateFormat: 'Date Format',
        currency: 'Currency',
        timezone: 'Timezone',

        // Messages
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Failed to save settings',
        loadError: 'Failed to load data',

        // Dashboard specific
        welcomeBack: 'Welcome back',
        virtualEvent: 'Virtual Event',
        viewAllEvents: 'View all events →',
        upcomingEvents: 'Upcoming Events',
        unpublish: 'Unpublish',
        unlimited: 'Unlimited',
        uncategorized: 'Uncategorized',
        totalRevenue: 'Total Revenue',
        totalEvents: 'Total Events',
        ticketsSold: 'Tickets Sold',
        revenue: 'Revenue',
        publish: 'Publish',
        noEventsYet: 'No events yet',
        maxCapacity: 'Max Capacity',
        loadingDashboard: 'Loading your dashboard...',
        dashboardError: 'Failed to load dashboard data',
        publishedCount: '{count} published',

        // Analytics Dashboard
        analytics: 'Analytics',
        analyticsSubtitle: 'Comprehensive insights for your events',
        comprehensiveInsights: 'Comprehensive insights for your events',
        refreshData: 'Refresh',
        someDataCouldntBeLoaded: 'Some data couldn\'t be loaded:',

        // Key Metrics
        totalAttendees: 'Total Attendees',
        activeEvents: 'Active Events',
        venuesUsed: 'Venues Used',
        fromLastMonth: 'from last month',
        noRevenueYet: 'No revenue yet',
        noAttendeesYet: 'No attendees yet',
        eventsRunning: 'Events running',
        noActiveEvents: 'No active events',
        venuePartnerships: 'Venue partnerships',
        noVenuesYet: 'No venues yet',

        // Charts and Analytics
        topRevenueEvents: 'Top Revenue Events',
        noEventsWithRevenueData: 'No events with revenue data yet',
        createAndPublishEvents: 'Create and publish events',
        seeRevenueAnalytics: 'to see revenue analytics',
        paymentMethodDistribution: 'Payment Method Distribution',
        noPaymentDataAvailable: 'No payment data available',
        eventCapacityUtilization: 'Event Capacity Utilization',
        utilizationPercentage: 'utilization',
        noEventsFoundForPeriod: 'No events found for the selected period',
        monthlyTrends: 'Monthly Trends',

        // Demographics
        genderDistribution: 'Gender Distribution',
        noDemographicDataAvailable: 'No demographic data available',
        venuePerformance: 'Venue Performance',
        avgAttendance: 'Avg Attendance',
        noVenueDataAvailable: 'No venue data available',

        // Events Needing Attention
        eventsNeedingAttention: 'Events Needing Attention',
        utilization: 'utilization',
        daysUntilEvent: 'days until event',
        potentialIssues: 'Potential Issues:',
        recommendations: 'Recommendations:',
        allEventsPerformingWell: 'All events are performing well!',
        noEventsWithLowAttendance: 'No events with low attendance found',

        // Time periods
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        last3Months: 'Last 3 Months',
        last6Months: 'Last 6 Months',
        lastYear: 'Last Year',

        // Status messages
        checkingAuthentication: 'Checking authentication...',
        authenticationRequired: 'Authentication Required',
        pleaseLogInToView: 'Please log in to view the analytics dashboard.',
        goToLogin: 'Go to Login',

        // Orders and remaining
        orders: 'orders',
        organizationInformation: 'Organization Information',
        businessLicense: 'Business License',

        // Notification Settings (update existing ones)
        emailNotifications: 'Email Notifications',
        smsNotifications: 'SMS Notifications',
        newBookings: 'New Bookings',
        getNotifiedNewBooking: 'Get notified when someone books your event',
        cancellations: 'Cancellations',
        getNotifiedCancellations: 'Get notified when bookings are cancelled',
        lowInventoryNotifications: 'Low Inventory Notifications',
        dailyReports: 'Daily Reports',
        receiveDailySummary: 'Receive daily summary of bookings and revenue',
        weeklyReports: 'Weekly Reports',
        receiveWeeklyAnalytics: 'Receive weekly analytics and insights',
        monthlyReports: 'Monthly Reports',

        // Security Settings (update existing ones)
        securitySettings: 'Security Settings',
        twoFactorAuthentication: 'Two-Factor Authentication',
        addExtraLayerSecurity: 'Add an extra layer of security to your account',
        loginNotifications: 'Login Notifications',
        getNotifiedNewLogins: 'Get notified of new login attempts',
        sessionTimeout: 'Session Timeout',
        sessionTimeoutMinutes: 'Session Timeout (minutes)',

        // Password Settings
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmNewPassword: 'Confirm New Password',
        minimumCharacters: 'Minimum 6 characters',
        passwordsDoNotMatch: 'New passwords do not match',
        passwordTooShort: 'New password must be at least 6 characters long',
        changingPassword: 'Changing Password...',
        passwordChanged: 'Password Changed Successfully',

        // Event Default Settings
        eventDefaults: 'Event Defaults',
        defaultEventDuration: 'Default Event Duration',
        defaultEventDurationMinutes: 'Default Event Duration (minutes)',
        ticketSaleStart: 'Ticket Sale Start',
        ticketSaleStartDays: 'Ticket Sale Start (days before event)',
        defaultRefundPolicy: 'Default Refund Policy',
        requireApproval: 'Require Approval',
        requireApprovalBeforeLive: 'Require approval before events go live',
        autoPublish: 'Auto Publish',
        autoPublishWhenCreated: 'Automatically publish events when created',

        // Language & Region Settings
        languageRegion: 'Language & Region',
        languagePreferences: 'Language preferences and regional formats',
        regionalFormats: 'Regional formats',
        interfaceLanguage: 'Interface Language',
        timeDateFormats: 'Time & Date Formats',
        currencySettings: 'Currency Settings',
        livePreview: 'Live Preview',

        // Time Format Settings
        hour12Format: '12-hour format',
        hour24Format: '24-hour format',

        // Date Format Settings
        dateFormatExample: 'Example: {example}',

        // Display Settings
        displaySettings: 'Display Settings',
        fontSizeSmall: 'Small',
        fontSizeMedium: 'Medium',
        fontSizeLarge: 'Large',
        reduceSpacing: 'Reduce spacing between elements',

        // Theme Settings
        themeSettings: 'Theme Settings',
        choosePreferredTheme: 'Choose your preferred interface theme',
        cleanBrightInterface: 'Clean and bright interface',
        easyOnEyes: 'Easy on the eyes',
        followsSystemPreference: 'Follows system preference',
        accentColorSettings: 'Accent Color',
        chooseAccentColor: 'Choose your preferred accent color',

        // Success Messages
        settingsSavedSuccessfully: 'Settings saved successfully!',
        profileUpdatedSuccessfully: 'Profile updated successfully!',
        organizationUpdatedSuccessfully: 'Organization updated successfully!',
        preferencesUpdatedSuccessfully: 'Preferences updated successfully!',

        // Error Messages
        failedToUpdateProfile: 'Failed to update profile',
        failedToUpdateOrganization: 'Failed to update organization',
        failedToUpdatePreferences: 'Failed to update preferences',
        failedToChangePassword: 'Failed to change password',

        // Loading States
        loadingProfile: 'Loading profile...',
        savingChanges: 'Saving changes...',

        // Authentication (update existing)
        pleaseLoginToAccess: 'Please log in to access your settings.',

        // General Settings
        manageAccount: 'Manage your account and event preferences',
        eventPreferences: 'Event preferences',
        saved: 'Saved!',
        saveChanges: 'Save Changes',

        // Verification Status
        emailNotVerified: 'Email address not verified',
        phoneNotVerified: 'Phone number not verified',
        verified: 'Verified',

        // Color Names (for dynamic translation)
        blue: 'Blue',
        purple: 'Purple',
        green: 'Green',
        red: 'Red',
        orange: 'Orange',
        pink: 'Pink',

        // Size Names (for dynamic translation)
        small: 'Small',
        medium: 'Medium',
        large: 'Large',

        // Image Management
        eventImages: 'Event Images',
        bannerImage: 'Banner Image',
        bannerImageDescription: 'Large banner image displayed at the top of your event page',
        eventImage: 'Event Image',
        eventImageDescription: 'Main image shown in event listings and cards',
        noBannerImage: 'No banner image uploaded',
        noEventImage: 'No event image uploaded',
        changeBanner: 'Change Banner',
        uploadBanner: 'Upload Banner',
        changeImage: 'Change Image',
        uploadImage: 'Upload Image',
        uploadingImages: 'Uploading images...',
        imageGuidelines: 'Image Guidelines',
        supportedFormats: 'Supported formats',
        maxFileSize: 'Maximum file size',
        bannerRecommended: 'Banner recommended size',
        imageRecommended: 'Image recommended size',
        invalidImageFile: 'Invalid image file',
        imageUploadFailed: 'Image upload failed',
        imageUploadSuccess: 'Image uploaded successfully',
        selectImageFile: 'Select image file',
        imageProcessing: 'Processing image...',
        imagePreview: 'Image preview',
        removeImage: 'Remove image',
        cropImage: 'Crop image',
        rotateImage: 'Rotate image',
        imageQuality: 'Image quality',
        compressImage: 'Compress image',
        dropImageHere: 'Drop image here or click to upload',

        promoCodes: 'Promo Codes',
        createAndManageDiscountCodes: 'Create and manage discount codes for your events',
        createPromoCode: 'Create Promo Code',
        editPromoCode: 'Edit Promo Code',
        promoCodeAnalytics: 'Promo Code Analytics',

        // Stats and metrics
        totalCodes: 'Total Codes',
        activeCodes: 'Active Codes',
        totalUses: 'Total Uses',
        totalSavings: 'Total Savings',
        topPerformingCodes: 'Top Performing Codes',

        // Search and filters
        searchPromoCodes: 'Search promo codes...',
        allStatus: 'All Status',
        allScopes: 'All Scopes',
        organizerWide: 'Organizer-wide',
        eventSpecific: 'Event-specific',
        expired: 'Expired',
        scheduled: 'Scheduled',
        usedUp: 'Used Up',
        invalid: 'Invalid',

        // Table headers
        code: 'Code',
        details: 'Details',
        usage: 'Usage',
        period: 'Period',
        actions: 'Actions',

        // Promo code properties
        formattedValue: 'Discount Value',
        minimumOrderAmount: 'Min Order',
        maximumDiscountAmount: 'Max Discount',
        currentUsage: 'Current Usage',
        maxUsage: 'Max Usage',
        startDate: 'Start Date',
        endDate: 'End Date',

        // Actions and buttons
        copyCode: 'Copy code',
        viewAnalytics: 'View Analytics',
        refresh: 'Refresh',

        // Status messages
        copySuccess: 'Code copied to clipboard',
        deletePromoCodeConfirm: 'Are you sure you want to delete promo code "{code}"? This action cannot be undone.',
        promoCodeDeletedSuccessfully: 'Promo code deleted successfully',
        failedToDeletePromoCode: 'Failed to delete promo code',
        failedToLoadPromoCodes: 'Failed to load promo codes',
        loadingPromoCodes: 'Loading promo codes...',

        // Empty states
        noPromoCodesYet: 'No promo codes yet',
        createFirstPromoCode: 'Create Your First Promo Code',
        createFirstPromoCodeDescription: 'Create your first promo code to start offering discounts',
        noPromoCodesMatchFilters: 'No promo codes match your filters',
        adjustSearchOrFilterCriteria: 'Try adjusting your search or filter criteria',

        // Scope indicators
        eventSpecificDescription: 'Event-specific',
        organizerWideDescription: 'All events',

        // Usage indicators
        uses: 'uses',

        // Date formatting
        start: 'Start',
        end: 'End',

        // Performance section
        topPerformingCodesDescription: 'Your most successful promo codes',
        numberOne: '#1',

        // Analytics related
        viewDetailedAnalytics: 'View detailed analytics',
        promoCodePerformance: 'Promo Code Performance',

        // Form validation and creation
        promoCodeRequired: 'Promo code is required',
        promoCodeFormat: 'Promo code must contain only uppercase letters and numbers',
        discountValueRequired: 'Discount value is required',
        maxUsageRequired: 'Maximum usage is required',
        startDateRequired: 'Start date is required',
        endDateRequired: 'End date is required',
        endDateAfterStartDate: 'End date must be after start date',

        // Type indicators
        percentageOff: '% off',
        fixedAmountOff: '$ off',

        // Create/Edit specific
        basicSettings: 'Basic Settings',
        discountSettings: 'Discount Settings',
        scopeSettings: 'Scope Settings',
        usageSettings: 'Usage Settings',
        advancedSettings: 'Advanced Settings',

        // Success messages
        promoCodeCreatedSuccessfully: 'Promo code created successfully!',
        promoCodeUpdatedSuccessfully: 'Promo code updated successfully!',

        // Error messages
        failedToCreatePromoCode: 'Failed to create promo code',
        failedToUpdatePromoCode: 'Failed to update promo code',
        cannotEditUsedPromoCode: 'Cannot edit promo code that has been used',

        // Analytics specific
        usageByDay: 'Usage by Day',
        usageByEvent: 'Usage by Event',
        conversionRate: 'Conversion Rate',
        averageDiscount: 'Average Discount',
        totalOrderValue: 'Total Order Value',

        // Status descriptions
        activeDescription: 'Currently active and available for use',
        inactiveDescription: 'Deactivated and not available for use',
        expiredDescription: 'Past the end date',
        scheduledDescription: 'Not yet active, starts in the future',
        editing: 'Editing',
        used: 'used',
        discountType: 'Discount Type',
        typeCannotBeChanged: 'Type cannot be changed after creation',
        codeCannotBeChanged: 'Code cannot be changed after creation',
        optionalDescriptionReference: 'Optional description for internal reference',
        orderMustBeAtLeast: 'Order must be at least this amount to use promo code',
        capMaximumDiscount: 'Cap the maximum discount amount for percentage-based codes',
        promoCodeScope: 'Promo Code Scope',
        scopeCannotBeChanged: 'Scope cannot be changed after creation',
        maxUsagePerUser: 'Maximum Usage Per User',
        limitUsagePerUser: 'Limit how many times each user can use this promo code',
        statusSettings: 'Status Settings',
        activeStatus: 'Active Status',
        inactivePromoCodesNote: 'Inactive promo codes cannot be used by customers',
        promoCodeWillBeDeactivated: 'This promo code will be deactivated and cannot be used by customers.',
        editingGuidelines: 'Editing Guidelines',
        cannotEdit: 'Cannot Edit',
        descriptionAndNotes: 'Description and notes',
        endDateExtendOnly: 'End date (extend only)',
        maxUsageIncreaseOnly: 'Max usage (increase only)',
        activeInactiveStatus: 'Active/inactive status',
        promoCodeItself: 'Promo code itself',
        discountTypeAndValue: 'Discount type & value (if used)',
        scopeAndEventAssignment: 'Scope and event assignment',
        anyFieldIfUsed: 'Any field if code has been used',
        changesEffectNote: 'Changes to dates and limits take effect immediately. Promo codes with existing usage are protected to maintain purchase history integrity.',
        hide: 'Hide',
        show: 'Show',
        preview: 'Preview',


        codeCannotBeChangedAfterCreation: 'Code cannot be changed after creation',
        optionalDescriptionForInternalReference: 'Optional description for internal reference',
        typeCannotBeChangedAfterCreation: 'Type cannot be changed after creation',
        scopeCannotBeChangedAfterCreation: 'Scope cannot be changed after creation',
        orderMustBeAtLeastThisAmount: 'Order must be at least this amount to use promo code',
        capMaximumDiscountAmountForPercentage: 'Cap the maximum discount amount for percentage-based codes',
        limitHowManyTimesEachUserCanUse: 'Limit how many times each user can use this promo code',
        inactivePromoCodesCannotBeUsed: 'Inactive promo codes cannot be used by customers',

        promoCodeHasBeenUsedTimes: 'This promo code has been used {count} time(s)',
        editingDisabledToPreserveIntegrity: 'Editing is disabled to preserve purchase data integrity',
        performanceInsights: 'Performance Insights',
        usageRate: 'Usage Rate',
        timesUsed: 'Times Used',
        promoCodeHasBeenUsedAndLocked: 'This promo code has been used and is locked for editing to maintain purchase history integrity',
        changesEffectImmediately: 'Changes to dates and limits take effect immediately',

        currentUsageCannotReduceBelow: 'Current usage: {count} (cannot reduce below this)',
        discountValueMustBePositive: 'Discount value must be a positive number',
        percentageValueCannotExceed100: 'Percentage value cannot exceed 100%',
        fixedAmountCannotExceed10000: 'Fixed amount cannot exceed $10,000',
        startDateCannotBeInPast: 'Start date cannot be in the past',
        endDateCannotBeMoreThan2Years: 'End date cannot be more than 2 years from start date',
        maximumUsageCountCannotExceed10000: 'Maximum usage count cannot exceed 10,000',
        minimumOrderAmountCannotExceed100000: 'Minimum order amount cannot exceed $100,000',
        maximumDiscountAmountCannotExceed10000: 'Maximum discount amount cannot exceed $10,000',
        maximumDiscountCannotExceedValue: 'Maximum discount cannot exceed the discount value',
        maxUsagePerUserCannotExceed100: 'Maximum usage per user cannot exceed 100',

        showAdvancedOptions: 'Show Advanced Settings',
        hideAdvancedOptions: 'Hide Advanced Settings',


        warning: 'Warning',

        // Analytics Page Specific Keys
        detailedPerformanceMetrics: 'Detailed performance metrics for {code}',
        usedCount: '{used} / {total} used',
        totalDiscountsGiven: 'Total Discount Given',
        ofMaximumUsage: 'Of maximum usage',
        customersavings: 'Customer savings',
        orderValue: 'Order Value',
        totalrevenueimpact: 'Total revenue impact',
        discount: 'discount',
        promoCodeNotUsedYet: 'This promo code hasn\'t been used by any customers yet.',
        peakDay: 'Peak Day',
        averageDaily: 'Average Daily',
        activeDays: 'Active Days',
        analyticsInformation: 'Analytics Information:',
        metricsIncluded: '📊 Metrics Included:',
        dataUpdates: '🔄 Data Updates:',
        realTimeUsageTracking: 'Real-time usage tracking',
        revenueImpactAnalysis: 'Revenue impact analysis',
        customerBehaviorInsights: 'Customer behavior insights',
        eventSpecificPerformance: 'Event-specific performance',
        analyticsUpdateRealTime: 'Analytics update in real-time',
        usageHistoryShowsAll: 'Usage history shows all transactions',
        timelineDataAggregated: 'Timeline data aggregated daily',
        conversionRatesCalculated: 'Conversion rates calculated automatically',
        allMonetaryValuesUSD: 'All monetary values are displayed in USD.',
        analyticsDataUpdatedImmediately: 'Analytics data is updated immediately when promo codes are used.',
        historicalDataPreserved: 'Historical data is preserved even if the promo code is deactivated.',
        analyticsNotFound: 'Analytics not found',
        unableToLoadAnalytics: 'Unable to load analytics for this promo code.',
        backToPromoCodes: 'Back to Promo Codes',
        retry: 'Retry',
        loadingAnalytics: 'Loading analytics...',
        unknown: 'Unknown',
        dateandusagesettings: "Date and Usage Settings",
        maximumusage: "Maximum Usage",
        maximumusageperusers: "Maximum Usage Per User",
        overview: "Overview",
        usageHistory: "Usage History",
        timeline: "Timeline",


        statustext: 'Status Text',

        customer: "Customer",
        order: "Order",
        subtotal: "Subtotal",
        date: "Date",

        thispromohasntbeenused: 'This promo code hasn\'t been used yet.',
        nousageyet: 'No usage yet',
        notimelinedata: 'No timeline data available',
        usageTimelineMessage: "Usage timeline will appear once customers start using this promo code.",
        usagehistory: '',
        promoCodeDetails: '',
        noTimelineData: '',
        timelineWillAppear: '',

        //attendee
        noimagesavailable: 'No images available',
        loadingevents: 'Loading events...',

        discoverEvents: "Discover Events",
        eventsAcrossCategories: "events across {count} categories",
        searchPlaceholder: "Search events, venues, organizers...",
        filters: "Filters",

        // Gallery
        galleryShowcase: "Gallery Showcase",
        featuredEventsAndVenues: "Featured events and venues",

        // Event Cards
        today: "Today!",
        tomorrow: "Tomorrow",
        soon: "Soon!",
        inDays: "In {days} days",
        limited: "Limited!",
        from: "From",
        viewAndBook: "View & Book",
        at: "at",

        // Sections
        searchResults: "Search Results",
        resultsFor: "Results for \"{term}\"",
        exploreAllEvents: "Explore all events",
        premierVenues: "Premier Venues",
        topEventLocations: "Top event locations",
        hot: "Hot",
        popular: "Popular",

        // Actions
        myTickets: "My Tickets",
        signIn: "Sign In",
        clearFilters: "Clear Filters",

        // Empty States
        noEventsAvailable: "No events available",
        tryAdjustingSearch: "Try adjusting your search",
        eventsWillAppearSoon: "Events will appear here soon",

        // Footer
        quickLinks: "Quick Links",
        browseEvents: "Browse Events",
        becomeAnOrganizer: "Become an Organizer",
        contactUs: "Contact Us",
        support: "Support",
        helpCenter: "Help Center",
        faq: "FAQ",
        contactSupport: "Contact Support",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        stayUpdated: "Stay Updated",
        enterYourEmail: "Enter your email",
        availableWorldwide: "Available Worldwide",

        // Additional
        scheduleText: "Schedule",
        featuredEvents: "Featured Events",
        categories: "Categories",

        clearSearch: "Clear Search",
        ticketsavailable: "Tickets Available",

        // Add to English translations (en):
        by: 'By',
        eventsHosted: 'events hosted',
        yourPremierDestination: 'Your premier destination for discovering and booking amazing events.',
        connectWithExperiences: 'Connect with experiences that matter to you.',
        home: 'Home',
        eventStreet: '123 Event Street',
        shahAlam: 'Shah Alam, Selangor 40150',
        malaysia: 'Malaysia',
        monFriHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
        satSunHours: 'Sat - Sun: 10:00 AM - 4:00 PM',
        allRightsReserved: 'All rights reserved',
        eventBanner: 'Event Banner',
        eventGallery: 'Event Gallery',
        eventNotFound: 'Event Not Found',
        backToEvents: 'Back to Events',
        featured: 'Featured',
        aboutThisEvent: 'About This Event',
        onlineEventNote: 'This event will be held online. Access details will be provided after purchase.',
        eventOrganizer: 'Event Organizer',
        venueInformation: 'Venue Information',
        visitWebsite: 'Visit Website',
        inYourCart: 'In Your Cart',
        items: 'items',
        remove: 'Remove',
        total: 'Total',
        getTickets: 'Get Tickets',
        available: 'Available',
        noTicketsAvailable: 'No tickets available yet',
        maxPerOrder: 'Max {max} per order',
        addToCart: 'Add to Cart',
        soldOut: 'Sold Out',
        notAvailable: 'Not Available',
        proceedToCheckout: 'Proceed to Checkout',

        manageTickets: 'View and manage all your event tickets',
        valid: 'Valid',
        cancelled: 'Cancelled',
        upcoming: 'Upcoming',
        pastEvents: 'Past Events',
        attended: 'Events Attended',
        download: 'Download',
        attendeeInformation: 'Attendee Information',
        purchaseDetails: 'Purchase Details',
        purchaseDate: 'Purchase Date',
        checkInDate: 'Check-in Date',
        viewEventDetails: 'View Event Details',

        // Order confirmation and profile specific translations
        orderNotFound: 'Order not found',
        purchaseSuccessful: 'Purchase Successful!',
        ticketsConfirmedSentEmail: 'Your tickets have been confirmed and sent to your email.',
        eventDetails: 'Event Details',
        orderDetails: 'Order Details',
        orderNumber: 'Order Number',
        totalAmount: 'Total Amount',
        orderDate: 'Order Date',
        yourTickets: 'Your Tickets',
        ticketsCount: '{count} ticket(s)',
        qrCode: 'QR Code',
        importantNotice: 'Important Notice',
        bringTicketsAndId: 'Please bring your tickets (printed or on mobile) and a valid ID to the event. QR codes will be scanned at entry.',
        viewMyTickets: 'View My Tickets',
        browseMoreEvents: 'Browse More Events',
        checkEmailForDetails: 'Check your email for detailed tickets and event information.',
        downloadData: 'Download My Data',
        defaultTimeZone: 'Default Time Zone for Events',

        serviceFee: 'Service Fee',
        tax: 'Tax',

        completePurchase: 'Complete Purchase',
        minutes: 'minutes',
        hours: 'hours',
        hour: 'hour', 

        monday: 'Monday',

        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',

        saturday: 'Saturday',
        sunday: 'Sunday',

        // Months
        jan: 'January',
        feb: 'February',
        mar: 'March',
        apr: 'April',
        may: 'May',
        jun: 'June',
        jul: 'July',
        aug: 'August',
        sep: 'September',
        oct: 'October',
        nov: 'November',
        dec: 'December',
            
    },
    // Spanish translations
    es: {
        // Common
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        view: 'Ver',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        confirm: 'Confirmar',
        back: 'Atrás',
        create: 'Crear',
        update: 'Actualizar',

        // Navigation
        dashboard: 'Panel',
        events: 'Eventos',
        settings: 'Configuración',
        profile: 'Perfil',
        logout: 'Cerrar Sesión',

        // Settings
        personalInformation: 'Información Personal',
        organization: 'Organización',
        notifications: 'Notificaciones',
        security: 'Seguridad',
        appearance: 'Apariencia',
        language: 'Idioma',
        preferences: 'Preferencias',

        // Profile
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        phoneNumber: 'Número de Teléfono',
        companyName: 'Nombre de la Empresa',
        address: 'Dirección',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: 'Código Postal',
        country: 'País',

        // Events
        createEvent: 'Crear Evento',
        editEvent: 'Editar Evento',
        eventTitle: 'Título del Evento',
        eventDescription: 'Descripción del Evento',
        eventDate: 'Fecha del Evento',
        eventTime: 'Hora del Evento',
        eventLocation: 'Ubicación del Evento',
        ticketPrice: 'Precio del Boleto',
        yourEvents: 'Tus Eventos',
        createYourFirstEvent: 'Crear Tu Primer Evento',
        createFirstEventPrompt: 'Crea tu primer evento para comenzar con EventPro.',
        eventsSubtitle: 'Gestiona tus eventos y rastrea su rendimiento',
        allEvents: 'Todos los Eventos',
        unpublished: 'No Publicado',
        searchEvents: 'Buscar eventos...',
        noDescriptionAvailable: 'Sin descripción disponible',
        dateNotSet: 'Fecha no establecida',
        invalidDate: 'Fecha inválida',
        timeNotSet: 'Hora no establecida',
        invalidTime: 'Hora inválida',
        confirmDeleteEvent: '¿Estás seguro de que quieres eliminar "{title}"? Esta acción no se puede deshacer.',
        failedToDeleteEvent: 'Error al eliminar evento',
        failedToTogglePublish: 'Error al {action} evento',
        noEventsMatchSearch: 'Ningún evento coincide con tu búsqueda',
        adjustSearchCriteria: 'Intenta ajustar tus criterios de búsqueda o filtro',

        // Event Form
        createNewEvent: 'Crear Nuevo Evento',
        editEventDetails: 'Editar Evento',
        fillEventDetails: 'Completa los detalles para crear tu evento',
        updateEventDetails: 'Actualiza los detalles de tu evento',
        basicInformation: 'Información Básica',
        eventTitleRequired: 'El título del evento es obligatorio',
        enterEventTitle: 'Ingresa el título del evento',
        descriptionRequired: 'La descripción del evento es obligatoria',
        describeEventDetail: 'Describe tu evento en detalle...',
        categoryRequired: 'La categoría es obligatoria',
        selectCategory: 'Seleccionar categoría',
        maxCapacityRequired: 'La capacidad máxima debe ser mayor a 0',
        maximumAttendees: 'Máximo de asistentes',
        eventImageUrl: 'URL de Imagen del Evento',
        enterImageUrl: 'https://ejemplo.com/imagen-evento.jpg',

        // Date & Time
        dateTime: 'Fecha y Hora',
        multiDayEvent: 'Evento de múltiples días: {count} días',
        dayEvent: 'Evento de {count} día',
        startDateTime: 'Fecha y Hora de Inicio',
        startDateTimeRequired: 'La fecha de inicio del evento es obligatoria',
        endDateTime: 'Fecha y Hora de Fin',
        leaveEmptySingleSession: 'Deja vacío para eventos de una sola sesión',
        endDateAfterStart: 'La fecha de fin debe ser posterior a la fecha de inicio',
        registrationDeadline: 'Fecha Límite de Registro',
        whenRegistrationClose: '¿Cuándo debe cerrarse el registro? (opcional)',
        registrationDeadlineBeforeEvent: 'La fecha límite de registro debe ser antes del inicio del evento',

        // Location
        location: 'Ubicación',
        onlineEvent: 'Este es un evento en línea',
        venueRequired: 'Se requiere un lugar para eventos presenciales',
        selectVenue: 'Seleccionar lugar',
        locationDetails: 'Detalles de Ubicación',
        meetingLinkPlatform: 'Enlace de reunión o detalles de plataforma',
        additionalLocationInfo: 'Información adicional de ubicación',

        // Ticket Types
        ticketTypes: 'Tipos de Boletos',
        addTicketType: 'Agregar Tipo de Boleto',
        ticketTypesCount: 'Tipos de Boletos',
        totalTypes: 'Tipos Totales',
        editable: 'Editable',
        locked: 'Bloqueado',
        noTicketTypesYet: 'Aún no hay tipos de boletos',
        addTicketTypesToStart: 'Agrega tipos de boletos para comenzar a vender boletos para tu evento',
        createFirstTicketType: 'Crear Primer Tipo de Boleto',
        ticketTypeName: 'Nombre del Boleto',
        ticketTypeNameRequired: 'El nombre del boleto es obligatorio',
        ticketDescription: 'Descripción',
        optionalTicketDescription: 'Descripción opcional para este tipo de boleto',
        price: 'Precio',
        priceRequired: 'Se requiere un precio válido',
        quantity: 'Cantidad',
        quantityRequired: 'La cantidad de boletos debe ser mayor a 0',
        quantityGreaterThanZero: 'La cantidad debe ser mayor a 0',
        ticketActive: 'Activo (disponible para compra)',
        availableForPurchase: 'Disponible para compra',
        createTicketType: 'Crear Tipo de Boleto',
        updateTicketType: 'Actualizar Tipo de Boleto',
        editTicketType: 'Editar Tipo de Boleto',

        // Smart Editing
        smartTicketEditing: '💡 Edición Inteligente de Tipos de Boleto',
        whenCanEdit: '✅ Cuándo PUEDES editar:',
        eventDraftStatus: '• El evento está en estado BORRADOR',
        noTicketsSold: '• No se han vendido boletos aún',
        eventNotPublished: '• El evento no está publicado',
        whenEditingLocked: '🔒 Cuándo la edición está BLOQUEADA:',
        eventIsPublished: '• El evento está publicado',
        ticketsAlreadySold: '• Ya se han vendido boletos',
        eventStatusNotDraft: '• El estado del evento no es BORRADOR',
        safeToEdit: 'Seguro para editar - sin ventas aún',
        lockedToPreserve: 'Bloqueado para preservar datos de ventas',
        ticketsSoldCount: '{count} boleto(s) ya vendidos. La edición está bloqueada para preservar datos de compra.',
        cannotCreateTicketTypes: 'No se pueden crear nuevos tipos de boletos. {count} boleto(s) ya han sido vendidos.',
        salesDataIntegrity: 'El evento está publicado. No se pueden crear tipos de boletos para preservar la integridad de los datos de ventas.',

        // Publishing
        publishingOptions: 'Opciones de Publicación',
        publishEventImmediately: 'Publicar evento inmediatamente (hacerlo visible al público)',
        makeVisiblePublic: 'Hacerlo visible al público',
        publishUnpublishLater: 'Siempre puedes publicar o despublicar tu evento más tarde desde el panel',
        currentlyPublished: 'Actualmente Publicado',
        currentlyUnpublished: 'Actualmente No Publicado',
        usePublishButtons: 'Usa los botones de publicar/despublicar en la lista de eventos para cambiar este estado',
        changePublishStatus: 'Cambiar estado de publicación',

        // Validation
        fixErrorsBelow: 'Por favor corrige los errores a continuación',
        formValidationError: 'Por favor corrige los errores del formulario',
        requiredField: 'Este campo es obligatorio',
        invalidInput: 'Entrada inválida',

        // Success/Error Messages
        eventCreatedSuccessfully: '¡Evento y todos los tipos de boletos creados exitosamente!',
        eventUpdatedSuccessfully: '¡Evento actualizado exitosamente!',
        ticketTypeCreatedSuccessfully: '¡Tipo de boleto creado exitosamente!',
        ticketTypeUpdatedSuccessfully: '¡Tipo de boleto actualizado exitosamente!',
        failedToCreateEvent: 'Error al crear evento. Por favor intenta de nuevo.',
        failedToUpdateEvent: 'Error al actualizar evento. Por favor intenta de nuevo.',
        failedToCreateTicketType: 'Error al crear tipo de boleto',
        failedToUpdateTicketType: 'Error al actualizar tipo de boleto',
        creatingEvent: 'Creando Evento...',
        updatingEvent: 'Actualizando Evento...',
        redirectingToDashboard: 'Redirigiendo al panel...',
        redirectingToEventDetail: 'Redirigiendo a detalles del evento...',

        // Capacity and Venues
        capacity: 'Capacidad',
        venue: 'Lugar',
        selectAVenue: 'Selecciona un lugar',
        venueWithCapacity: '{name} - {city} (Capacidad: {capacity})',

        // Categories
        category: 'Categoría',
        technology: 'Tecnología',
        business: 'Negocios',
        music: 'Música',
        sports: 'Deportes',
        education: 'Educación',

        // Event States
        published: 'Publicado',
        draft: 'Borrador',
        online: 'En línea',
        inPerson: 'Presencial',

        // Multi-day
        multiDaySchedule: 'Horario de múltiples días',

        // Venue Management
        venues: 'Lugares',
        createVenue: 'Crear Lugar',
        venueName: 'Nombre del Lugar',
        venueNameRequired: 'El nombre del lugar es obligatorio',
        enterVenueName: 'Ingresa el nombre del lugar',
        venueAddress: 'Dirección',
        addressRequired: 'La dirección es obligatoria',
        enterVenueAddress: 'Ingresa la dirección del lugar',
        venueState: 'Estado',
        enterState: 'Ingresa el estado',
        enterStateOptional: 'Ingresa el estado (opcional)',
        venueCountry: 'País',
        countryRequired: 'El país es obligatorio',
        enterCountry: 'Ingresa el país',
        venueZipCode: 'Código Postal',
        enterZipCode: 'Ingresa el código postal',
        enterZipCodeOptional: 'Ingresa el código postal (opcional)',
        capacityRequired: 'La capacidad debe ser mayor a 0',
        maximumCapacity: 'Capacidad máxima',
        contactEmail: 'Email de Contacto',
        contactPhone: 'Teléfono de Contacto',
        website: 'Sitio Web',
        latitude: 'Latitud',
        longitude: 'Longitud',
        description: 'Descripción',
        venueDescription: 'Descripción del Lugar',
        describeVenue: 'Describe el lugar, amenidades, características especiales...',
        venueImageUrl: 'URL de Imagen del Lugar',
        validEmailRequired: 'Por favor ingresa una dirección de email válida',
        latitudeBetween: 'La latitud debe estar entre -90 y 90',
        longitudeBetween: 'La longitud debe estar entre -180 y 180',
        optionalMapIntegration: 'Opcional: Para integración con mapas',
        createNewVenue: 'Crear Nuevo Lugar',
        venueCreatedSuccessfully: '¡Lugar creado exitosamente!',
        failedToCreateVenue: 'Error al crear lugar. Por favor intenta de nuevo.',
        failedToFetchVenues: 'Error al cargar lugares',
        creatingVenue: 'Creando...',
        loadingVenues: 'Cargando lugares...',
        searchVenues: 'Buscar lugares...',
        allCities: 'Todas las Ciudades',
        noVenuesFound: 'No se encontraron lugares',
        adjustFilters: 'Intenta ajustar tus filtros',
        getStartedFirstVenue: 'Comienza creando tu primer lugar',
        venueLocation: 'Ubicación',
        venueCapacity: 'Capacidad',
        venueEvents: 'Eventos',
        venueStatus: 'Estado',
        active: 'Activo',
        inactive: 'Inactivo',
        eventsCount: '{count} eventos',
        viewAvailableVenues: 'Ver lugares disponibles y crear nuevos',
        createNewOnes: 'Crear nuevos',

        // Ticket Management
        tickets: 'Boletos',
        ticketManagement: 'Gestión de Boletos',
        manageTicketTypes: 'Gestiona tipos de boletos, valida boletos y maneja check-ins',
        validateTickets: 'Validar Boletos',
        checkIn: 'Check-in',
        ticketValidation: 'Validación de Boletos',
        ticketCheckIn: 'Check-in de Boletos',
        ticketsAndCheckIn: 'Boletos y Check-in',

        // Ticket Types Management
        createTicketTypeAction: 'Crear Tipo de Boleto',
        ticketTypeLimitations: '⚠️ Importante: Limitaciones de Creación de Tipos de Boleto',
        publishedEventsRestriction: 'Eventos publicados: Los tipos de boletos no se pueden modificar para preservar los datos de ventas existentes',
        eventsWithSalesRestriction: 'Eventos con ventas: La edición de tipos de boletos se bloquea una vez que se venden boletos',
        draftStatusRequired: 'Para crear tipos de boletos: Los eventos deben estar en estado BORRADOR sin ventas existentes',
        alternativeCreateEvent: 'Alternativa: Crear un nuevo evento si necesitas diferentes tipos de boletos',
        onlyWorksForDraft: 'Solo funciona para eventos en borrador sin ventas existentes',
        createNewEventLink: 'Crear Nuevo Evento',
        manageEventsLink: 'Gestionar Eventos',

        // Ticket Form
        selectAnEvent: 'Seleccionar un evento',
        ticketCreationRequirements: '⚠️ Requisitos de Creación de Boletos',
        eventMustBeDraft: 'El evento debe estar en estado BORRADOR (no publicado)',
        noExistingTicketSales: 'El evento no debe tener ventas de boletos existentes',
        mustBeEventOrganizer: 'Debes ser el organizador del evento',
        editTicketsDuringCreation: 'Si esto falla, edita los tipos de boletos durante la creación del evento',
        ticketEvent: 'Evento',
        eventRequired: 'El evento es obligatorio',
        noEventsFound: 'No se encontraron eventos',
        needCreateEventFirst: 'Necesitas crear un evento primero antes de crear tipos de boletos.',

        // Ticket Types Display
        loadingTicketTypes: 'Cargando tipos de boletos...',
        noTicketTypesFound: 'No se encontraron tipos de boletos',
        adjustFiltersOrCreate: 'Intenta ajustar tus filtros o crear tu primer tipo de boleto',
        createFirstTicketTypePrompt: 'Crear tu primer tipo de boleto',
        ticketType: 'Tipo de Boleto',
        event: 'Evento',
        availability: 'Disponibilidad',
        status: 'Estado',
        remaining: 'restantes',

        // Validation Tab
        validateTicket: 'Validar Boleto',
        enterTicketNumber: 'Ingresa el número de boleto',
        validating: 'Validando...',
        validate: 'Validar',
        validTicket: 'Boleto Válido',
        invalidTicket: 'Boleto Inválido',
        ticketNumber: 'Número de Boleto',
        attendeeName: 'Asistente',
        alreadyUsed: 'Ya Usado',
        notUsed: 'No Usado',

        // Check-in Tab
        checkInTicket: 'Check-in de Boleto',
        enterTicketNumberCheckIn: 'Ingresa el número de boleto para check-in',
        checkingIn: 'Haciendo check-in...',
        ticketCheckedInSuccessfully: 'Check-in de Boleto Exitoso',

        // Ticket Warnings
        importantTicketLimitations: '⚠️ Importante: Limitaciones de Creación de Tipos de Boleto',
        cannotModifyPublished: '• Eventos publicados: Los tipos de boletos no se pueden modificar para preservar los datos de ventas existentes',
        editingLockedAfterSales: '• Eventos con ventas: La edición de tipos de boletos se bloquea una vez que se venden boletos',
        draftStatusForCreation: '• Para crear tipos de boletos: Los eventos deben estar en estado BORRADOR sin ventas existentes',
        createNewEventAlternative: '• Alternativa: Crear un nuevo evento si necesitas diferentes tipos de boletos',

        // Business Rules
        businessRulesWarning: '⚠️ Requisitos de Creación de Boletos',

        // Ticket States
        ticketInactive: 'Inactivo',

        // General UI
        optional: 'opcional',
        required: 'obligatorio',

        // Appearance
        theme: 'Tema',
        lightMode: 'Modo Claro',
        darkMode: 'Modo Oscuro',
        autoMode: 'Modo Automático',
        accentColor: 'Color de Acento',
        fontSize: 'Tamaño de Fuente',
        compactMode: 'Modo Compacto',

        // Time and Date
        timeFormat: 'Formato de Hora',
        dateFormat: 'Formato de Fecha',
        currency: 'Moneda',
        timezone: 'Zona Horaria',

        // Messages
        saveSuccess: '¡Configuración guardada exitosamente!',
        saveError: 'Error al guardar la configuración',
        loadError: 'Error al cargar los datos',

        // Dashboard specific
        welcomeBack: '¡Bienvenido de vuelta',
        virtualEvent: 'Evento Virtual',
        viewAllEvents: 'Ver todos los eventos →',
        upcomingEvents: 'Próximos Eventos',
        unpublish: 'Despublicar',
        unlimited: 'Ilimitado',
        uncategorized: 'Sin categoría',
        totalRevenue: 'Ingresos Totales',
        totalEvents: 'Total de Eventos',
        ticketsSold: 'Boletos Vendidos',
        revenue: 'Ingresos',
        publish: 'Publicar',
        noEventsYet: 'Aún no hay eventos',
        maxCapacity: 'Capacidad Máxima',
        loadingDashboard: 'Cargando tu panel...',
        dashboardError: 'Error al cargar los datos del panel',
        publishedCount: '{count} publicados',

        // Analytics Dashboard
        analytics: 'Analíticas',
        analyticsSubtitle: 'Insights integrales para tus eventos',
        comprehensiveInsights: 'Insights integrales para tus eventos',
        refreshData: 'Actualizar',
        someDataCouldntBeLoaded: 'Algunos datos no se pudieron cargar:',

        // Key Metrics
        totalAttendees: 'Total de Asistentes',
        activeEvents: 'Eventos Activos',
        venuesUsed: 'Lugares Utilizados',
        fromLastMonth: 'del mes pasado',
        noRevenueYet: 'Sin ingresos aún',
        noAttendeesYet: 'Sin asistentes aún',
        eventsRunning: 'Eventos en curso',
        noActiveEvents: 'Sin eventos activos',
        venuePartnerships: 'Alianzas de lugares',
        noVenuesYet: 'Sin lugares aún',

        // Charts and Analytics
        topRevenueEvents: 'Eventos con Mayores Ingresos',
        noEventsWithRevenueData: 'Aún no hay eventos con datos de ingresos',
        createAndPublishEvents: 'Crea y publica eventos',
        seeRevenueAnalytics: 'para ver analíticas de ingresos',
        paymentMethodDistribution: 'Distribución de Métodos de Pago',
        noPaymentDataAvailable: 'No hay datos de pago disponibles',
        eventCapacityUtilization: 'Utilización de Capacidad de Eventos',
        utilizationPercentage: 'utilización',
        noEventsFoundForPeriod: 'No se encontraron eventos para el período seleccionado',
        monthlyTrends: 'Tendencias Mensuales',

        // Demographics
        genderDistribution: 'Distribución por Género',
        noDemographicDataAvailable: 'No hay datos demográficos disponibles',
        venuePerformance: 'Rendimiento de Lugares',
        avgAttendance: 'Asistencia Promedio',
        noVenueDataAvailable: 'No hay datos de lugares disponibles',

        // Events Needing Attention
        eventsNeedingAttention: 'Eventos que Necesitan Atención',
        utilization: 'utilización',
        daysUntilEvent: 'días hasta el evento',
        potentialIssues: 'Problemas Potenciales:',
        recommendations: 'Recomendaciones:',
        allEventsPerformingWell: '¡Todos los eventos están funcionando bien!',
        noEventsWithLowAttendance: 'No se encontraron eventos con baja asistencia',

        // Time periods
        last7Days: 'Últimos 7 Días',
        last30Days: 'Últimos 30 Días',
        last3Months: 'Últimos 3 Meses',
        last6Months: 'Últimos 6 Meses',
        lastYear: 'Último Año',

        // Status messages
        checkingAuthentication: 'Verificando autenticación...',
        authenticationRequired: 'Autenticación Requerida',
        pleaseLogInToView: 'Por favor inicia sesión para ver el panel de analíticas.',
        goToLogin: 'Ir al Login',

        // Orders and remaining
        orders: 'órdenes',
        organizationInformation: 'Información de la Organización',
        businessLicense: 'Licencia Comercial',

        // Notification Settings (update existing ones)
        emailNotifications: 'Notificaciones por Email',
        smsNotifications: 'Notificaciones por SMS',
        newBookings: 'Nuevas Reservas',
        getNotifiedNewBooking: 'Recibir notificaciones cuando alguien reserve tu evento',
        cancellations: 'Cancelaciones',
        getNotifiedCancellations: 'Recibir notificaciones cuando se cancelen reservas',
        lowInventoryNotifications: 'Notificaciones de Inventario Bajo',
        dailyReports: 'Informes Diarios',
        receiveDailySummary: 'Recibir resumen diario de reservas e ingresos',
        weeklyReports: 'Informes Semanales',
        receiveWeeklyAnalytics: 'Recibir analíticas y insights semanales',
        monthlyReports: 'Informes Mensuales',

        // Security Settings (update existing ones)
        securitySettings: 'Configuración de Seguridad',
        twoFactorAuthentication: 'Autenticación de Dos Factores',
        addExtraLayerSecurity: 'Añade una capa extra de seguridad a tu cuenta',
        loginNotifications: 'Notificaciones de Inicio de Sesión',
        getNotifiedNewLogins: 'Recibir notificaciones de nuevos intentos de inicio de sesión',
        sessionTimeout: 'Tiempo de Espera de Sesión',
        sessionTimeoutMinutes: 'Tiempo de Espera de Sesión (minutos)',

        // Password Settings
        changePassword: 'Cambiar Contraseña',
        currentPassword: 'Contraseña Actual',
        newPassword: 'Nueva Contraseña',
        confirmNewPassword: 'Confirmar Nueva Contraseña',
        minimumCharacters: 'Mínimo 6 caracteres',
        passwordsDoNotMatch: 'Las nuevas contraseñas no coinciden',
        passwordTooShort: 'La nueva contraseña debe tener al menos 6 caracteres',
        changingPassword: 'Cambiando Contraseña...',
        passwordChanged: 'Contraseña Cambiada Exitosamente',

        // Event Default Settings
        eventDefaults: 'Configuraciones Predeterminadas del Evento',
        defaultEventDuration: 'Duración Predeterminada del Evento',
        defaultEventDurationMinutes: 'Duración Predeterminada del Evento (minutos)',
        ticketSaleStart: 'Inicio de Venta de Entradas',
        ticketSaleStartDays: 'Inicio de Venta de Entradas (días antes del evento)',
        defaultRefundPolicy: 'Política de Reembolso Predeterminada',
        requireApproval: 'Requerir Aprobación',
        requireApprovalBeforeLive: 'Requiere aprobación antes de publicar eventos',
        autoPublish: 'Publicación Automática',
        autoPublishWhenCreated: 'Publicar automáticamente eventos al crearlos',

        // Language & Region Settings
        languageRegion: 'Idioma y Región',
        languagePreferences: 'Preferencias de idioma y formatos regionales',
        regionalFormats: 'Formatos regionales',
        interfaceLanguage: 'Idioma de la Interfaz',
        timeDateFormats: 'Formatos de Hora y Fecha',
        currencySettings: 'Configuración de Moneda',
        livePreview: 'Vista Previa en Vivo',

        // Time Format Settings
        hour12Format: 'Formato de 12 horas',
        hour24Format: 'Formato de 24 horas',

        // Date Format Settings
        dateFormatExample: 'Ejemplo: {example}',

        // Display Settings
        displaySettings: 'Configuración de Pantalla',
        fontSizeSmall: 'Pequeño',
        fontSizeMedium: 'Mediano',
        fontSizeLarge: 'Grande',
        reduceSpacing: 'Reducir espaciado entre elementos',

        // Theme Settings
        themeSettings: 'Configuración de Tema',
        choosePreferredTheme: 'Elige tu tema de interfaz preferido',
        cleanBrightInterface: 'Interfaz limpia y brillante',
        easyOnEyes: 'Más cómodo para la vista',
        followsSystemPreference: 'Sigue la preferencia del sistema',
        accentColorSettings: 'Color de Acento',
        chooseAccentColor: 'Elige tu color de acento preferido',

        // Success Messages
        settingsSavedSuccessfully: '¡Configuración guardada exitosamente!',
        profileUpdatedSuccessfully: '¡Perfil actualizado exitosamente!',
        organizationUpdatedSuccessfully: '¡Organización actualizada exitosamente!',
        preferencesUpdatedSuccessfully: '¡Preferencias actualizadas exitosamente!',

        // Error Messages
        failedToUpdateProfile: 'Error al actualizar el perfil',
        failedToUpdateOrganization: 'Error al actualizar la organización',
        failedToUpdatePreferences: 'Error al actualizar las preferencias',
        failedToChangePassword: 'Error al cambiar la contraseña',

        // Loading States
        loadingProfile: 'Cargando perfil...',
        savingChanges: 'Guardando cambios...',

        // Authentication
        pleaseLoginToAccess: 'Por favor, inicia sesión para acceder a tu configuración.',

        // General Settings
        manageAccount: 'Administra tu cuenta y preferencias de eventos',
        eventPreferences: 'Preferencias de eventos',
        saved: '¡Guardado!',
        saveChanges: 'Guardar Cambios',

        // Verification Status
        emailNotVerified: 'Correo electrónico no verificado',
        phoneNotVerified: 'Número de teléfono no verificado',
        verified: 'Verificado',

        // Color Names
        blue: 'Azul',
        purple: 'Morado',
        green: 'Verde',
        red: 'Rojo',
        orange: 'Naranja',
        pink: 'Rosa',

        // Size Names
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',

        // Image Management
        eventImages: 'Imágenes del Evento',
        bannerImage: 'Imagen de Banner',
        bannerImageDescription: 'Imagen de banner grande mostrada en la parte superior de tu página de evento',
        eventImage: 'Imagen del Evento',
        eventImageDescription: 'Imagen principal mostrada en listados y tarjetas de eventos',
        noBannerImage: 'No se ha subido imagen de banner',
        noEventImage: 'No se ha subido imagen del evento',
        changeBanner: 'Cambiar Banner',
        uploadBanner: 'Subir Banner',
        changeImage: 'Cambiar Imagen',
        uploadImage: 'Subir Imagen',
        uploadingImages: 'Subiendo imágenes...',
        imageGuidelines: 'Directrices de Imagen',
        supportedFormats: 'Formatos soportados',
        maxFileSize: 'Tamaño máximo de archivo',
        bannerRecommended: 'Tamaño recomendado del banner',
        imageRecommended: 'Tamaño recomendado de imagen',
        invalidImageFile: 'Archivo de imagen inválido',
        imageUploadFailed: 'Error al subir imagen',
        imageUploadSuccess: 'Imagen subida exitosamente',
        selectImageFile: 'Seleccionar archivo de imagen',
        imageProcessing: 'Procesando imagen...',
        imagePreview: 'Vista previa de imagen',
        removeImage: 'Eliminar imagen',
        cropImage: 'Recortar imagen',
        rotateImage: 'Rotar imagen',
        imageQuality: 'Calidad de imagen',
        compressImage: 'Comprimir imagen',
        dropImageHere: 'Suelta la imagen aquí o haz clic para subir',

        // Promo code properties
        formattedValue: 'Valor del Descuento',
        minimumOrderAmount: 'Pedido Mín.',
        maximumDiscountAmount: 'Descuento Máx.',
        currentUsage: 'Uso Actual',
        maxUsage: 'Uso Máximo',
        startDate: 'Fecha de Inicio',
        endDate: 'Fecha de Fin',

        // Actions and buttons
        copyCode: 'Copiar código',
        viewAnalytics: 'Ver Analíticas',
        refresh: 'Actualizar',

        // Status messages
        copySuccess: 'Código copiado al portapapeles',
        deletePromoCodeConfirm: '¿Estás seguro de que quieres eliminar el código promocional "{code}"? Esta acción no se puede deshacer.',
        promoCodeDeletedSuccessfully: 'Código promocional eliminado exitosamente',
        failedToDeletePromoCode: 'Error al eliminar el código promocional',
        failedToLoadPromoCodes: 'Error al cargar los códigos promocionales',
        loadingPromoCodes: 'Cargando códigos promocionales...',

        // Empty states
        noPromoCodesYet: 'Aún no hay códigos promocionales',
        createFirstPromoCode: 'Crea Tu Primer Código Promocional',
        createFirstPromoCodeDescription: 'Crea tu primer código promocional para comenzar a ofrecer descuentos',
        noPromoCodesMatchFilters: 'Ningún código promocional coincide con tus filtros',
        adjustSearchOrFilterCriteria: 'Intenta ajustar tu búsqueda o criterios de filtro',

        // Scope indicators
        eventSpecificDescription: 'Evento específico',
        organizerWideDescription: 'Todos los eventos',

        // Usage indicators
        uses: 'usos',

        // Date formatting
        start: 'Inicio',
        end: 'Fin',

        // Performance section
        topPerformingCodesDescription: 'Tus códigos promocionales más exitosos',
        numberOne: '#1',

        // Analytics related
        viewDetailedAnalytics: 'Ver analíticas detalladas',
        promoCodePerformance: 'Rendimiento del Código Promocional',

        // Form validation and creation
        promoCodeRequired: 'El código promocional es obligatorio',
        promoCodeFormat: 'El código promocional debe contener solo letras mayúsculas y números',
        discountValueRequired: 'El valor del descuento es obligatorio',
        maxUsageRequired: 'El uso máximo es obligatorio',
        startDateRequired: 'La fecha de inicio es obligatoria',
        endDateRequired: 'La fecha de fin es obligatoria',
        endDateAfterStartDate: 'La fecha de fin debe ser posterior a la fecha de inicio',

        // Type indicators
        percentageOff: '% de descuento',
        fixedAmountOff: '$ de descuento',

        // Create/Edit specific
        basicSettings: 'Configuración Básica',
        discountSettings: 'Configuración de Descuento',
        scopeSettings: 'Configuración de Alcance',
        usageSettings: 'Configuración de Uso',
        advancedSettings: 'Configuración Avanzada',

        // Success messages
        promoCodeCreatedSuccessfully: '¡Código promocional creado exitosamente!',
        promoCodeUpdatedSuccessfully: '¡Código promocional actualizado exitosamente!',

        // Error messages
        failedToCreatePromoCode: 'Error al crear el código promocional',
        failedToUpdatePromoCode: 'Error al actualizar el código promocional',
        cannotEditUsedPromoCode: 'No se puede editar un código promocional que ha sido usado',

        // Analytics specific
        usageByDay: 'Uso por Día',
        usageByEvent: 'Uso por Evento',
        conversionRate: 'Tasa de Conversión',
        averageDiscount: 'Descuento Promedio',
        totalOrderValue: 'Valor Total del Pedido',

        // Status descriptions
        activeDescription: 'Actualmente activo y disponible para usar',
        inactiveDescription: 'Desactivado y no disponible para usar',
        expiredDescription: 'Pasada la fecha de fin',
        scheduledDescription: 'Aún no activo, comienza en el futuro',



        // Page headers and navigation
        promoCodes: 'Códigos Promocionales',
        createAndManageDiscountCodes: 'Crea y gestiona códigos de descuento para tus eventos',
        createPromoCode: 'Crear Código Promocional',
        editPromoCode: 'Editar Código Promocional',
        promoCodeAnalytics: 'Analíticas de Código Promocional',

        // Stats and metrics
        totalCodes: 'Códigos Totales',
        activeCodes: 'Códigos Activos',
        totalUses: 'Usos Totales',
        totalSavings: 'Ahorros Totales',
        topPerformingCodes: 'Códigos Más Exitosos',

        // Search and filters
        searchPromoCodes: 'Buscar códigos promocionales...',
        allStatus: 'Todos los Estados',
        allScopes: 'Todos los Alcances',
        organizerWide: 'Todo el organizador',
        eventSpecific: 'Evento específico',
        expired: 'Expirado',
        scheduled: 'Programado',
        usedUp: 'Agotado',
        invalid: 'Inválido',

        // Table headers
        code: 'Código',
        details: 'Detalles',
        usage: 'Uso',
        period: 'Período',
        actions: 'Acciones',

        editing: 'Editando',
        used: 'usado',
        discountType: 'Tipo de Descuento',
        typeCannotBeChanged: 'El tipo no se puede cambiar después de la creación',
        codeCannotBeChanged: 'El código no se puede cambiar después de la creación',
        optionalDescriptionReference: 'Descripción opcional para referencia interna',
        orderMustBeAtLeast: 'El pedido debe ser al menos esta cantidad para usar el código promocional',
        capMaximumDiscount: 'Limitar el monto máximo de descuento para códigos basados en porcentaje',
        promoCodeScope: 'Alcance del Código Promocional',
        scopeCannotBeChanged: 'El alcance no se puede cambiar después de la creación',
        maxUsagePerUser: 'Uso Máximo por Usuario',
        limitUsagePerUser: 'Limitar cuántas veces cada usuario puede usar este código promocional',
        statusSettings: 'Configuración de Estado',
        activeStatus: 'Estado Activo',
        inactivePromoCodesNote: 'Los códigos promocionales inactivos no pueden ser usados por los clientes',
        promoCodeWillBeDeactivated: 'Este código promocional será desactivado y no podrá ser usado por los clientes.',
        editingGuidelines: 'Directrices de Edición',
        cannotEdit: 'No se Puede Editar',
        descriptionAndNotes: 'Descripción y notas',
        endDateExtendOnly: 'Fecha de fin (solo extender)',
        maxUsageIncreaseOnly: 'Uso máximo (solo aumentar)',
        activeInactiveStatus: 'Estado activo/inactivo',
        promoCodeItself: 'El código promocional en sí',
        discountTypeAndValue: 'Tipo y valor de descuento (si se usa)',
        scopeAndEventAssignment: 'Alcance y asignación de evento',
        anyFieldIfUsed: 'Cualquier campo si el código ha sido usado',
        changesEffectNote: 'Los cambios en fechas y límites tienen efecto inmediato. Los códigos promocionales con uso existente están protegidos para mantener la integridad del historial de compras.',
        hide: 'Ocultar',
        show: 'Mostrar',
        preview: 'Vista previa',



        codeCannotBeChangedAfterCreation: 'El código no puede ser cambiado después de la creación',
        optionalDescriptionForInternalReference: 'Descripción opcional para referencia interna',
        typeCannotBeChangedAfterCreation: 'El tipo no puede ser cambiado después de la creación',
        scopeCannotBeChangedAfterCreation: 'El alcance no puede ser cambiado después de la creación',
        orderMustBeAtLeastThisAmount: 'El pedido debe ser de al menos esta cantidad para usar el código promocional',
        capMaximumDiscountAmountForPercentage: 'Limitar el monto máximo de descuento para códigos basados en porcentaje',
        limitHowManyTimesEachUserCanUse: 'Limitar cuántas veces cada usuario puede usar este código promocional',
        inactivePromoCodesCannotBeUsed: 'Los códigos promocionales inactivos no pueden ser usados por los clientes',
        promoCodeHasBeenUsedTimes: 'Este código promocional ha sido usado {count} vez/veces',
        editingDisabledToPreserveIntegrity: 'La edición está deshabilitada para preservar la integridad de los datos de compra',
        performanceInsights: 'Estadísticas de Rendimiento',
        usageRate: 'Tasa de Uso',
        timesUsed: 'Veces Usado',
        promoCodeHasBeenUsedAndLocked: 'Este código promocional ha sido usado y está bloqueado para edición para mantener la integridad del historial de compras',
        changesEffectImmediately: 'Los cambios en fechas y límites toman efecto inmediatamente',
        currentUsageCannotReduceBelow: 'Uso actual: {count} (no se puede reducir por debajo de esto)',
        discountValueMustBePositive: 'El valor del descuento debe ser un número positivo',
        percentageValueCannotExceed100: 'El valor del porcentaje no puede exceder el 100%',
        fixedAmountCannotExceed10000: 'El monto fijo no puede exceder $10,000',
        startDateCannotBeInPast: 'La fecha de inicio no puede estar en el pasado',
        endDateCannotBeMoreThan2Years: 'La fecha de fin no puede ser más de 2 años desde la fecha de inicio',
        maximumUsageCountCannotExceed10000: 'El conteo máximo de uso no puede exceder 10,000',
        minimumOrderAmountCannotExceed100000: 'El monto mínimo del pedido no puede exceder $100,000',
        maximumDiscountAmountCannotExceed10000: 'El monto máximo de descuento no puede exceder $10,000',
        maximumDiscountCannotExceedValue: 'El descuento máximo no puede exceder el valor del descuento',
        maxUsagePerUserCannotExceed100: 'El uso máximo por usuario no puede exceder 100',
        showAdvancedOptions: 'Mostrar Configuración Avanzada',
        hideAdvancedOptions: 'Ocultar Configuración Avanzada',
        warning: 'Advertencia',

        dateandusagesettings: 'Configuración de Fecha y Uso',
        maximumusage: 'Uso Máximo',
        maximumusageperusers: 'Uso Máximo por Usuario',
        detailedPerformanceMetrics: 'Métricas de Rendimiento Detalladas',

        promoCodeDetails: 'Detalles del Código Promocional',
        totalDiscountsGiven: 'Descuentos Totales Otorgados',
        overview: 'Resumen',
        usagehistory: 'Historial de Uso',
        timeline: 'Línea de Tiempo',
        usedCount: 'Usado {count} vez/veces',
        customersavings: 'Ahorros del Cliente',

        orderValue: 'Valor del Pedido',
        statustext: 'Estado',

        totalrevenueimpact: 'Impacto Total en Ingresos',
        analyticsInformation: 'Información de Analíticas',
        metricsIncluded: 'Métricas Incluidas',

        usageHistory: "Historial de Uso",
        promoCodeNotUsedYet: "Código Promocional Aún No Usado",
        ofMaximumUsage: "del Uso Máximo",
        discount: "Descuento",
        usageHistoryShowsAll: "El Historial de Uso Muestra Todo",
        timelineDataAggregated: "Datos de Cronología Agregados",
        revenueImpactAnalysis: "Análisis de Impacto en Ingresos",
        realTimeUsageTracking: "Seguimiento de Uso en Tiempo Real",
        historicalDataPreserved: "Datos Históricos Preservados",
        eventSpecificPerformance: "Rendimiento Específico del Evento",
        dataUpdates: "Actualizaciones de Datos",
        customerBehaviorInsights: "Insights de Comportamiento del Cliente",
        conversionRatesCalculated: "Tasas de Conversión Calculadas",
        analyticsUpdateRealTime: "Actualización de Analytics en Tiempo Real",
        analyticsDataUpdatedImmediately: "Datos de Analytics Actualizados Inmediatamente",
        allMonetaryValuesUSD: "Todos los Valores Monetarios en USD",

        customer: "Cliente",
        order: "Pedido",
        subtotal: "Subtotal",
        date: "Fecha",

        thispromohasntbeenused: "Este código promocional aún no ha sido usado",
        nousageyet: "Sin uso aún",
        notimelinedata: "No hay datos de línea de tiempo disponibles",
        usageTimelineMessage: "La cronología de uso aparecerá una vez que los clientes comiencen a usar este código promocional.",

        peakDay: 'Día Pico',
        averageDaily: 'Promedio Diario',
        activeDays: 'Días Activos',
        noTimelineData: 'No hay datos de cronología disponibles',
        timelineWillAppear: 'La cronología de uso aparecerá una vez que los clientes comiencen a usar este código promocional.',
        analyticsNotFound: 'Analytics no encontrado',
        unableToLoadAnalytics: 'No se pueden cargar las analíticas para este código promocional.',

        retry: 'Reintentar',
        loadingAnalytics: 'Cargando analytics...',
        unknown: 'Desconocido',
        backToPromoCodes: '',

        //attendee
        noimagesavailable: 'No hay imágenes disponibles',
        loadingevents: 'Cargando eventos...',

        // Hero Section
        discoverEvents: "Descubrir Eventos",
        eventsAcrossCategories: "eventos en {count} categorías",
        searchPlaceholder: "Buscar eventos, lugares, organizadores...",
        filters: "Filtros",

        // Gallery
        galleryShowcase: "Galería Destacada",
        featuredEventsAndVenues: "Eventos y lugares destacados",

        // Event Cards
        today: "¡Hoy!",
        tomorrow: "Mañana",
        soon: "¡Pronto!",
        inDays: "En {days} días",
        limited: "¡Limitado!",
        from: "Desde",
        viewAndBook: "Ver y Reservar",
        at: "a las",

        // Sections
        searchResults: "Resultados de Búsqueda",
        resultsFor: "Resultados para \"{term}\"",
        exploreAllEvents: "Explorar todos los eventos",
        premierVenues: "Lugares Premier",
        topEventLocations: "Principales ubicaciones de eventos",
        hot: "Popular",
        popular: "Popular",

        // Stats

        // Actions
        myTickets: "Mis Boletos",
        signIn: "Iniciar Sesión",
        clearFilters: "Limpiar Filtros",

        // Empty States
        noEventsAvailable: "No hay eventos disponibles",
        tryAdjustingSearch: "Intenta ajustar tu búsqueda",
        eventsWillAppearSoon: "Los eventos aparecerán aquí pronto",

        // Footer
        quickLinks: "Enlaces Rápidos",
        browseEvents: "Explorar Eventos",
        becomeAnOrganizer: "Conviértete en Organizador",
        contactUs: "Contáctanos",
        support: "Soporte",
        helpCenter: "Centro de Ayuda",
        faq: "Preguntas Frecuentes",
        contactSupport: "Contactar Soporte",
        privacyPolicy: "Política de Privacidad",
        termsOfService: "Términos de Servicio",
        stayUpdated: "Mantente Actualizado",
        enterYourEmail: "Ingresa tu email",
        availableWorldwide: "Disponible en Todo el Mundo",

        // Additional
        scheduleText: "Horario",
        featuredEvents: "Eventos Destacados",
        categories: "Categorías",

        clearSearch: "Limpiar Búsqueda",
        ticketsavailable: "Boletos Disponibles",

        // Add to Spanish translations (es):
        by: 'Por',
        eventsHosted: 'eventos organizados',
        yourPremierDestination: 'Tu destino principal para descubrir y reservar eventos increíbles.',
        connectWithExperiences: 'Conecta con experiencias que te importan.',
        home: 'Inicio',
        eventStreet: '123 Calle del Evento',
        shahAlam: 'Shah Alam, Selangor 40150',
        malaysia: 'Malasia',
        monFriHours: 'Lun - Vie: 9:00 AM - 6:00 PM',
        satSunHours: 'Sáb - Dom: 10:00 AM - 4:00 PM',
        allRightsReserved: 'Todos los derechos reservados',
        eventBanner: 'Banner del Evento',
        eventGallery: 'Galería del Evento',
        eventNotFound: 'Evento No Encontrado',
        backToEvents: 'Volver a Eventos',
        featured: 'Destacado',
        aboutThisEvent: 'Acerca de Este Evento',
        onlineEventNote: 'Este evento se realizará en línea. Los detalles de acceso se proporcionarán después de la compra.',
        eventOrganizer: 'Organizador del Evento',
        venueInformation: 'Información del Lugar',
        visitWebsite: 'Visitar Sitio Web',
        inYourCart: 'En Tu Carrito',
        items: 'artículos',
        remove: 'Eliminar',
        total: 'Total',
        getTickets: 'Obtener Boletos',
        available: 'Disponibles',
        noTicketsAvailable: 'Aún no hay boletos disponibles',
        maxPerOrder: 'Máx {max} por pedido',
        addToCart: 'Agregar al Carrito',
        soldOut: 'Agotado',
        notAvailable: 'No Disponible',
        proceedToCheckout: 'Proceder al Checkout',

        manageTickets: 'Ver y administrar todos tus boletos de eventos',
        valid: 'Válido',
        cancelled: 'Cancelado',
        upcoming: 'Próximos',
        pastEvents: 'Eventos Pasados',
        attended: 'Eventos Asistidos',
        download: 'Descargar',
        attendeeInformation: 'Información del Asistente',
        purchaseDetails: 'Detalles de Compra',
        purchaseDate: 'Fecha de Compra',
        checkInDate: 'Fecha de Check-in',
        viewEventDetails: 'Ver Detalles del Evento',

        // Order confirmation and profile specific translations
        orderNotFound: 'Pedido no encontrado',
        purchaseSuccessful: '¡Compra Exitosa!',
        ticketsConfirmedSentEmail: 'Tus boletos han sido confirmados y enviados a tu email.',
        eventDetails: 'Detalles del Evento',
        orderDetails: 'Detalles del Pedido',
        orderNumber: 'Número de Pedido',
        totalAmount: 'Monto Total',
        orderDate: 'Fecha del Pedido',
        yourTickets: 'Tus Boletos',
        ticketsCount: '{count} boleto(s)',
        qrCode: 'Código QR',
        importantNotice: 'Aviso Importante',
        bringTicketsAndId: 'Por favor trae tus boletos (impresos o en móvil) y una identificación válida al evento. Los códigos QR serán escaneados en la entrada.',
        viewMyTickets: 'Ver Mis Boletos',
        browseMoreEvents: 'Explorar Más Eventos',
        checkEmailForDetails: 'Revisa tu email para obtener boletos detallados e información del evento.',
        downloadData: 'Descargar Mis Datos',
        defaultTimeZone: 'Zona Horaria Predeterminada para Eventos',
        serviceFee: 'Tarifa de Servicio',
        tax: 'Impuesto',

        completePurchase: 'Completar Compra',
        minutes: 'minutos',
        hours: 'horas',
        hour: 'horas',

        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',

        jan: 'Enero',
        feb: 'Febrero',
        mar: 'Marzo',
        apr: 'Abril',
        may: 'Mayo',
        jun: 'Junio',
        jul: 'Julio',
        aug: 'Agosto',
        sep: 'Septiembre',
        oct: 'Octubre',
        nov: 'Noviembre',
        dec: 'Diciembre',
    },
    // French translations
    fr: {
        // Common
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        confirm: 'Confirmer',
        back: 'Retour',
        create: 'Créer',
        update: 'Mettre à jour',

        // Navigation
        dashboard: 'Tableau de bord',
        events: 'Événements',
        settings: 'Paramètres',
        profile: 'Profil',
        logout: 'Déconnexion',

        // Settings
        personalInformation: 'Informations personnelles',
        organization: 'Organisation',
        notifications: 'Notifications',
        security: 'Sécurité',
        appearance: 'Apparence',
        language: 'Langue',
        preferences: 'Préférences',

        // Profile
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        email: 'Email',
        phoneNumber: 'Numéro de téléphone',
        companyName: 'Nom de l\'entreprise',
        address: 'Adresse',
        city: 'Ville',
        state: 'État',
        zipCode: 'Code postal',
        country: 'Pays',

        // Events
        createEvent: 'Créer un événement',
        editEvent: 'Modifier l\'événement',
        eventTitle: 'Titre de l\'événement',
        eventDescription: 'Description de l\'événement',
        eventDate: 'Date de l\'événement',
        eventTime: 'Heure de l\'événement',
        eventLocation: 'Lieu de l\'événement',
        ticketPrice: 'Prix du billet',
        yourEvents: 'Vos événements',
        createYourFirstEvent: 'Créer votre premier événement',
        createFirstEventPrompt: 'Créez votre premier événement pour commencer avec EventPro.',
        eventsSubtitle: 'Gérez vos événements et suivez leurs performances',
        allEvents: 'Tous les événements',
        unpublished: 'Non publié',
        searchEvents: 'Rechercher des événements...',
        noDescriptionAvailable: 'Aucune description disponible',
        dateNotSet: 'Date non définie',
        invalidDate: 'Date invalide',
        timeNotSet: 'Heure non définie',
        invalidTime: 'Heure invalide',
        confirmDeleteEvent: 'Êtes-vous sûr de vouloir supprimer "{title}" ? Cette action ne peut pas être annulée.',
        failedToDeleteEvent: 'Échec de la suppression de l\'événement',
        failedToTogglePublish: 'Échec de {action} l\'événement',
        noEventsMatchSearch: 'Aucun événement ne correspond à votre recherche',
        adjustSearchCriteria: 'Essayez d\'ajuster vos critères de recherche ou de filtre',

        // Event Form
        createNewEvent: 'Créer un nouvel événement',
        editEventDetails: 'Modifier l\'événement',
        fillEventDetails: 'Remplissez les détails pour créer votre événement',
        updateEventDetails: 'Mettez à jour les détails de votre événement',
        basicInformation: 'Informations de base',
        eventTitleRequired: 'Le titre de l\'événement est requis',
        enterEventTitle: 'Entrez le titre de l\'événement',
        descriptionRequired: 'La description de l\'événement est requise',
        describeEventDetail: 'Décrivez votre événement en détail...',
        categoryRequired: 'La catégorie est requise',
        selectCategory: 'Sélectionner une catégorie',
        maxCapacityRequired: 'La capacité maximale doit être supérieure à 0',
        maximumAttendees: 'Nombre maximum de participants',
        eventImageUrl: 'URL de l\'image de l\'événement',
        enterImageUrl: 'https://exemple.com/image-evenement.jpg',

        // Date & Time
        dateTime: 'Date et heure',
        multiDayEvent: 'Événement de plusieurs jours: {count} jours',
        dayEvent: 'Événement de {count} jour',
        startDateTime: 'Date et heure de début',
        startDateTimeRequired: 'La date de début de l\'événement est requise',
        endDateTime: 'Date et heure de fin',
        leaveEmptySingleSession: 'Laissez vide pour les événements d\'une seule session',
        endDateAfterStart: 'La date de fin doit être postérieure à la date de début',
        registrationDeadline: 'Date limite d\'inscription',
        whenRegistrationClose: 'Quand l\'inscription doit-elle se fermer ? (optionnel)',
        registrationDeadlineBeforeEvent: 'La date limite d\'inscription doit être avant le début de l\'événement',

        // Location
        location: 'Lieu',
        onlineEvent: 'Ceci est un événement en ligne',
        venueRequired: 'Un lieu est requis pour les événements en personne',
        selectVenue: 'Sélectionner un lieu',
        locationDetails: 'Détails du lieu',
        meetingLinkPlatform: 'Lien de réunion ou détails de la plateforme',
        additionalLocationInfo: 'Informations supplémentaires sur le lieu',

        // Ticket Types
        ticketTypes: 'Types de billets',
        addTicketType: 'Ajouter un type de billet',
        ticketTypesCount: 'Types de billets',
        totalTypes: 'Types totaux',
        editable: 'Modifiable',
        locked: 'Verrouillé',
        noTicketTypesYet: 'Aucun type de billet pour le moment',
        addTicketTypesToStart: 'Ajoutez des types de billets pour commencer à vendre des billets pour votre événement',
        createFirstTicketType: 'Créer le premier type de billet',
        ticketTypeName: 'Nom du billet',
        ticketTypeNameRequired: 'Le nom du billet est requis',
        ticketDescription: 'Description',
        optionalTicketDescription: 'Description optionnelle pour ce type de billet',
        price: 'Prix ',
        priceRequired: 'Un prix valide est requis',
        quantity: 'Quantité',
        quantityRequired: 'La quantité de billets doit être supérieure à 0',
        quantityGreaterThanZero: 'La quantité doit être supérieure à 0',
        ticketActive: 'Actif (disponible à l\'achat)',
        availableForPurchase: 'Disponible à l\'achat',
        createTicketType: 'Créer un type de billet',
        updateTicketType: 'Mettre à jour le type de billet',
        editTicketType: 'Modifier le type de billet',

        // Smart Editing
        smartTicketEditing: '💡 Édition intelligente des types de billets',
        whenCanEdit: '✅ Quand vous POUVEZ modifier:',
        eventDraftStatus: '• L\'événement est en statut BROUILLON',
        noTicketsSold: '• Aucun billet vendu encore',
        eventNotPublished: '• L\'événement n\'est pas publié',
        whenEditingLocked: '🔒 Quand l\'édition est VERROUILLÉE:',
        eventIsPublished: '• L\'événement est publié',
        ticketsAlreadySold: '• Des billets ont déjà été vendus',
        eventStatusNotDraft: '• Le statut de l\'événement n\'est pas BROUILLON',
        safeToEdit: 'Sûr à modifier - aucune vente encore',
        lockedToPreserve: 'Verrouillé pour préserver les données de ventes',
        ticketsSoldCount: '{count} billet(s) déjà vendu(s). L\'édition est verrouillée pour préserver les données d\'achat.',
        cannotCreateTicketTypes: 'Impossible de créer de nouveaux types de billets. {count} billet(s) ont déjà été vendus.',
        salesDataIntegrity: 'L\'événement est publié. Impossible de créer des types de billets pour préserver l\'intégrité des données de ventes.',

        // Publishing
        publishingOptions: 'Options de publication',
        publishEventImmediately: 'Publier l\'événement immédiatement (le rendre visible au public)',
        makeVisiblePublic: 'Le rendre visible au public',
        publishUnpublishLater: 'Vous pouvez toujours publier ou dépublier votre événement plus tard depuis le tableau de bord',
        currentlyPublished: 'Actuellement publié',
        currentlyUnpublished: 'Actuellement non publié',
        usePublishButtons: 'Utilisez les boutons publier/dépublier dans la liste des événements pour changer ce statut',
        changePublishStatus: 'Changer le statut de publication',

        // Validation
        fixErrorsBelow: 'Veuillez corriger les erreurs ci-dessous',
        formValidationError: 'Veuillez corriger les erreurs du formulaire',
        requiredField: 'Ce champ est requis',
        invalidInput: 'Entrée invalide',

        // Success/Error Messages
        eventCreatedSuccessfully: 'Événement et tous les types de billets créés avec succès !',
        eventUpdatedSuccessfully: 'Événement mis à jour avec succès !',
        ticketTypeCreatedSuccessfully: 'Type de billet créé avec succès !',
        ticketTypeUpdatedSuccessfully: 'Type de billet mis à jour avec succès !',
        failedToCreateEvent: 'Échec de la création de l\'événement. Veuillez réessayer.',
        failedToUpdateEvent: 'Échec de la mise à jour de l\'événement. Veuillez réessayer.',
        failedToCreateTicketType: 'Échec de la création du type de billet',
        failedToUpdateTicketType: 'Échec de la mise à jour du type de billet',
        creatingEvent: 'Création de l\'événement...',
        updatingEvent: 'Mise à jour de l\'événement...',
        redirectingToDashboard: 'Redirection vers le tableau de bord...',
        redirectingToEventDetail: 'Redirection vers les détails de l\'événement...',

        // Capacity and Venues
        capacity: 'Capacité',
        venue: 'Lieu',
        selectAVenue: 'Sélectionner un lieu',
        venueWithCapacity: '{name} - {city} (Capacité: {capacity})',

        // Categories
        category: 'Catégorie',
        technology: 'Technologie',
        business: 'Affaires',
        music: 'Musique',
        sports: 'Sports',
        education: 'Éducation',

        // Event States
        published: 'Publié',
        draft: 'Brouillon',
        online: 'En ligne',
        inPerson: 'En personne',

        // Multi-day
        multiDaySchedule: 'Programme de plusieurs jours',

        // Venue Management
        venues: 'Lieux',
        createVenue: 'Créer un lieu',
        venueName: 'Nom du lieu',
        venueNameRequired: 'Le nom du lieu est requis',
        enterVenueName: 'Entrez le nom du lieu',
        venueAddress: 'Adresse',
        addressRequired: 'L\'adresse est requise',
        enterVenueAddress: 'Entrez l\'adresse du lieu',
        venueState: 'État',
        enterState: 'Entrez l\'état',
        enterStateOptional: 'Entrez l\'état (optionnel)',
        venueCountry: 'Pays',
        countryRequired: 'Le pays est requis',
        enterCountry: 'Entrez le pays',
        venueZipCode: 'Code postal',
        enterZipCode: 'Entrez le code postal',
        enterZipCodeOptional: 'Entrez le code postal (optionnel)',
        capacityRequired: 'La capacité doit être supérieure à 0',
        maximumCapacity: 'Capacité maximale',
        contactEmail: 'Email de contact',
        contactPhone: 'Téléphone de contact',
        website: 'Site web',
        latitude: 'Latitude',
        longitude: 'Longitude',
        description: 'Description',
        venueDescription: 'Description du lieu',
        describeVenue: 'Décrivez le lieu, les commodités, les caractéristiques spéciales...',
        venueImageUrl: 'URL de l\'image du lieu',
        validEmailRequired: 'Veuillez entrer une adresse email valide',
        latitudeBetween: 'La latitude doit être entre -90 et 90',
        longitudeBetween: 'La longitude doit être entre -180 et 180',
        optionalMapIntegration: 'Optionnel: Pour l\'intégration de cartes',
        createNewVenue: 'Créer un nouveau lieu',
        venueCreatedSuccessfully: 'Lieu créé avec succès !',
        failedToCreateVenue: 'Échec de la création du lieu. Veuillez réessayer.',
        failedToFetchVenues: 'Échec du chargement des lieux',
        creatingVenue: 'Création...',
        loadingVenues: 'Chargement des lieux...',
        searchVenues: 'Rechercher des lieux...',
        allCities: 'Toutes les villes',
        noVenuesFound: 'Aucun lieu trouvé',
        adjustFilters: 'Essayez d\'ajuster vos filtres',
        getStartedFirstVenue: 'Commencez en créant votre premier lieu',
        venueLocation: 'Lieu',
        venueCapacity: 'Capacité',
        venueEvents: 'Événements',
        venueStatus: 'Statut',
        active: 'Actif',
        inactive: 'Inactif',
        eventsCount: '{count} événements',
        viewAvailableVenues: 'Voir les lieux disponibles et en créer de nouveaux',
        createNewOnes: 'Créer de nouveaux',

        // Ticket Management
        tickets: 'Billets',
        ticketManagement: 'Gestion des billets',
        manageTicketTypes: 'Gérez les types de billets, validez les billets et gérez les enregistrements',
        validateTickets: 'Valider les billets',
        checkIn: 'Enregistrement',
        ticketValidation: 'Validation des billets',
        ticketCheckIn: 'Enregistrement des billets',
        ticketsAndCheckIn: 'Billets et enregistrement',

        // Ticket Types Management
        createTicketTypeAction: 'Créer un type de billet',
        ticketTypeLimitations: '⚠️ Important: Limitations de création de types de billets',
        publishedEventsRestriction: 'Événements publiés: Les types de billets ne peuvent pas être modifiés pour préserver les données de ventes existantes',
        eventsWithSalesRestriction: 'Événements avec ventes: L\'édition des types de billets est verrouillée une fois que les billets sont vendus',
        draftStatusRequired: 'Pour la création de types de billets: Les événements doivent être en statut BROUILLON sans ventes existantes',
        alternativeCreateEvent: 'Alternative: Créer un nouvel événement si vous avez besoin de différents types de billets',
        onlyWorksForDraft: 'Ne fonctionne que pour les événements en brouillon sans ventes existantes',
        createNewEventLink: 'Créer un nouvel événement',
        manageEventsLink: 'Gérer les événements',

        // Ticket Form
        selectAnEvent: 'Sélectionner un événement',
        ticketCreationRequirements: '⚠️ Exigences de création de billets',
        eventMustBeDraft: 'L\'événement doit être en statut BROUILLON (non publié)',
        noExistingTicketSales: 'L\'événement ne doit pas avoir de ventes de billets existantes',
        mustBeEventOrganizer: 'Vous devez être l\'organisateur de l\'événement',
        editTicketsDuringCreation: 'Si cela échoue, modifiez les types de billets pendant la création de l\'événement',
        ticketEvent: 'Événement',
        eventRequired: 'L\'événement est requis',
        noEventsFound: 'Aucun événement trouvé',
        needCreateEventFirst: 'Vous devez créer un événement d\'abord avant de créer des types de billets.',

        // Ticket Types Display
        loadingTicketTypes: 'Chargement des types de billets...',
        noTicketTypesFound: 'Aucun type de billet trouvé',
        adjustFiltersOrCreate: 'Essayez d\'ajuster vos filtres ou créez votre premier type de billet',
        createFirstTicketTypePrompt: 'Créer votre premier type de billet',
        ticketType: 'Type de billet',
        event: 'Événement',
        availability: 'Disponibilité',
        status: 'Statut',
        remaining: 'restants',

        // Validation Tab
        validateTicket: 'Valider le billet',
        enterTicketNumber: 'Entrez le numéro de billet',
        validating: 'Validation...',
        validate: 'Valider',
        validTicket: 'Billet valide',
        invalidTicket: 'Billet invalide',
        ticketNumber: 'Numéro de billet',
        attendeeName: 'Participant',
        alreadyUsed: 'Déjà utilisé',
        notUsed: 'Non utilisé',

        // Check-in Tab
        checkInTicket: 'Enregistrement de billet',
        enterTicketNumberCheckIn: 'Entrez le numéro de billet pour l\'enregistrement',
        checkingIn: 'Enregistrement...',
        ticketCheckedInSuccessfully: 'Billet enregistré avec succès',

        // Ticket Warnings
        importantTicketLimitations: '⚠️ Important: Limitations de création de types de billets',
        cannotModifyPublished: '• Événements publiés: Les types de billets ne peuvent pas être modifiés pour préserver les données de ventes existantes',
        editingLockedAfterSales: '• Événements avec ventes: L\'édition des types de billets est verrouillée une fois que les billets sont vendus',
        draftStatusForCreation: '• Pour la création de types de billets: Les événements doivent être en statut BROUILLON sans ventes existantes',
        createNewEventAlternative: '• Alternative: Créer un nouvel événement si vous avez besoin de différents types de billets',

        // Business Rules
        businessRulesWarning: '⚠️ Exigences de création de billets',

        // Ticket States
        ticketInactive: 'Inactif',

        // General UI
        optional: 'optionnel',
        required: 'requis',

        // Appearance
        theme: 'Thème',
        lightMode: 'Mode clair',
        darkMode: 'Mode sombre',
        autoMode: 'Mode automatique',
        accentColor: 'Couleur d\'accent',
        fontSize: 'Taille de police',
        compactMode: 'Mode compact',

        // Time and Date
        timeFormat: 'Format d\'heure',
        dateFormat: 'Format de date',
        currency: 'Devise',
        timezone: 'Fuseau horaire',

        // Messages
        saveSuccess: 'Paramètres sauvegardés avec succès !',
        saveError: 'Échec de la sauvegarde des paramètres',
        loadError: 'Échec du chargement des données',

        // Dashboard specific
        welcomeBack: 'Bon retour, {name} !',
        virtualEvent: 'Événement virtuel',
        viewAllEvents: 'Voir tous les événements →',
        upcomingEvents: 'Événements à venir',
        unpublish: 'Dépublier',
        unlimited: 'Illimité',
        uncategorized: 'Non catégorisé',
        totalRevenue: 'Revenus totaux',
        totalEvents: 'Total des événements',
        ticketsSold: 'Billets vendus',
        revenue: 'Revenus',
        publish: 'Publier',
        noEventsYet: 'Aucun événement encore',
        maxCapacity: 'Capacité maximale',
        loadingDashboard: 'Chargement de votre tableau de bord...',
        dashboardError: 'Échec du chargement des données du tableau de bord',
        publishedCount: '{count} publiés',

        // Analytics Dashboard
        analytics: 'Analytiques',
        analyticsSubtitle: 'Aperçus complets pour vos événements',
        comprehensiveInsights: 'Aperçus complets pour vos événements',
        refreshData: 'Actualiser',
        someDataCouldntBeLoaded: 'Certaines données n\'ont pas pu être chargées :',

        // Key Metrics
        totalAttendees: 'Total des participants',
        activeEvents: 'Événements actifs',
        venuesUsed: 'Lieux utilisés',
        fromLastMonth: 'du mois dernier',
        noRevenueYet: 'Aucun revenu encore',
        noAttendeesYet: 'Aucun participant encore',
        eventsRunning: 'Événements en cours',
        noActiveEvents: 'Aucun événement actif',
        venuePartnerships: 'Partenariats de lieux',
        noVenuesYet: 'Aucun lieu encore',

        // Charts and Analytics
        topRevenueEvents: 'Événements les plus rentables',
        noEventsWithRevenueData: 'Aucun événement avec des données de revenus encore',
        createAndPublishEvents: 'Créez et publiez des événements',
        seeRevenueAnalytics: 'pour voir les analyses de revenus',
        paymentMethodDistribution: 'Répartition des méthodes de paiement',
        noPaymentDataAvailable: 'Aucune donnée de paiement disponible',
        eventCapacityUtilization: 'Utilisation de la capacité des événements',
        utilizationPercentage: 'utilisation',
        noEventsFoundForPeriod: 'Aucun événement trouvé pour la période sélectionnée',
        monthlyTrends: 'Tendances mensuelles',

        // Demographics
        genderDistribution: 'Répartition par sexe',
        noDemographicDataAvailable: 'Aucune donnée démographique disponible',
        venuePerformance: 'Performance des lieux',
        avgAttendance: 'Fréquentation moyenne',
        noVenueDataAvailable: 'Aucune donnée de lieu disponible',

        // Events Needing Attention
        eventsNeedingAttention: 'Événements nécessitant une attention',
        utilization: 'utilisation',
        daysUntilEvent: 'jours jusqu\'à l\'événement',
        potentialIssues: 'Problèmes potentiels :',
        recommendations: 'Recommandations :',
        allEventsPerformingWell: 'Tous les événements se portent bien !',
        noEventsWithLowAttendance: 'Aucun événement avec une faible fréquentation trouvé',

        // Time periods
        last7Days: '7 derniers jours',
        last30Days: '30 derniers jours',
        last3Months: '3 derniers mois',
        last6Months: '6 derniers mois',
        lastYear: 'Dernière année',

        // Status messages
        checkingAuthentication: 'Vérification de l\'authentification...',
        authenticationRequired: 'Authentification requise',
        pleaseLogInToView: 'Veuillez vous connecter pour voir le tableau de bord analytique.',
        goToLogin: 'Aller à la connexion',

        // Orders and remaining
        orders: 'commandes',
        // Organization Settings
        organizationInformation: 'Informations de l\'Organisation',
        businessLicense: 'Licence Commerciale',

        // Notification Settings
        emailNotifications: 'Notifications par Email',
        smsNotifications: 'Notifications par SMS',
        newBookings: 'Nouvelles Réservations',
        getNotifiedNewBooking: 'Recevez une notification lorsque quelqu\'un réserve votre événement',
        cancellations: 'Annulations',
        getNotifiedCancellations: 'Recevez une notification lorsque des réservations sont annulées',
        lowInventoryNotifications: 'Notifications de Stock Faible',
        dailyReports: 'Rapports Quotidiens',
        receiveDailySummary: 'Recevez un résumé quotidien des réservations et des revenus',
        weeklyReports: 'Rapports Hebdomadaires',
        receiveWeeklyAnalytics: 'Recevez des analyses et statistiques hebdomadaires',
        monthlyReports: 'Rapports Mensuels',

        // Security Settings
        securitySettings: 'Paramètres de Sécurité',
        twoFactorAuthentication: 'Authentification à Deux Facteurs',
        addExtraLayerSecurity: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
        loginNotifications: 'Notifications de Connexion',
        getNotifiedNewLogins: 'Recevez une notification des nouvelles tentatives de connexion',
        sessionTimeout: 'Délai d\'Expiration de Session',
        sessionTimeoutMinutes: 'Délai d\'expiration de session (minutes)',

        // Password Settings
        changePassword: 'Changer le Mot de Passe',
        currentPassword: 'Mot de Passe Actuel',
        newPassword: 'Nouveau Mot de Passe',
        confirmNewPassword: 'Confirmer le Nouveau Mot de Passe',
        minimumCharacters: 'Minimum 6 caractères',
        passwordsDoNotMatch: 'Les nouveaux mots de passe ne correspondent pas',
        passwordTooShort: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        changingPassword: 'Changement du Mot de Passe...',
        passwordChanged: 'Mot de Passe Modifié avec Succès',

        // Event Default Settings
        eventDefaults: 'Paramètres par Défaut des Événements',
        defaultEventDuration: 'Durée par Défaut de l\'Événement',
        defaultEventDurationMinutes: 'Durée par défaut de l\'événement (minutes)',
        ticketSaleStart: 'Début de la Vente de Billets',
        ticketSaleStartDays: 'Début de la vente de billets (jours avant l\'événement)',
        defaultRefundPolicy: 'Politique de Remboursement par Défaut',
        requireApproval: 'Approbation Requise',
        requireApprovalBeforeLive: 'Approbation requise avant la publication des événements',
        autoPublish: 'Publication Automatique',
        autoPublishWhenCreated: 'Publier automatiquement les événements lors de leur création',

        // Language & Region Settings
        languageRegion: 'Langue et Région',
        languagePreferences: 'Préférences de langue et formats régionaux',
        regionalFormats: 'Formats régionaux',
        interfaceLanguage: 'Langue de l\'Interface',
        timeDateFormats: 'Formats d\'Heure et de Date',
        currencySettings: 'Paramètres de Devise',
        livePreview: 'Aperçu en Direct',

        // Time Format Settings
        hour12Format: 'Format 12 heures',
        hour24Format: 'Format 24 heures',

        // Date Format Settings
        dateFormatExample: 'Exemple : {example}',

        // Display Settings
        displaySettings: 'Paramètres d\'Affichage',
        fontSizeSmall: 'Petit',
        fontSizeMedium: 'Moyen',
        fontSizeLarge: 'Grand',
        reduceSpacing: 'Réduire l\'espacement entre les éléments',

        // Theme Settings
        themeSettings: 'Paramètres du Thème',
        choosePreferredTheme: 'Choisissez votre thème d\'interface préféré',
        cleanBrightInterface: 'Interface claire et lumineuse',
        easyOnEyes: 'Reposant pour les yeux',
        followsSystemPreference: 'Suit les préférences du système',
        accentColorSettings: 'Couleur d\'Accentuation',
        chooseAccentColor: 'Choisissez votre couleur d\'accentuation préférée',

        // Success Messages
        settingsSavedSuccessfully: 'Paramètres enregistrés avec succès !',
        profileUpdatedSuccessfully: 'Profil mis à jour avec succès !',
        organizationUpdatedSuccessfully: 'Organisation mise à jour avec succès !',
        preferencesUpdatedSuccessfully: 'Préférences mises à jour avec succès !',

        // Error Messages
        failedToUpdateProfile: 'Échec de la mise à jour du profil',
        failedToUpdateOrganization: 'Échec de la mise à jour de l\'organisation',
        failedToUpdatePreferences: 'Échec de la mise à jour des préférences',
        failedToChangePassword: 'Échec du changement de mot de passe',

        // Loading States
        loadingProfile: 'Chargement du profil...',
        savingChanges: 'Enregistrement des modifications...',
        pleaseLoginToAccess: 'Veuillez vous connecter pour accéder à vos paramètres.',

        // General Settings
        manageAccount: 'Gérez votre compte et vos préférences d\'événements',
        eventPreferences: 'Préférences d\'événements',
        saved: 'Enregistré !',
        saveChanges: 'Enregistrer les Modifications',

        // Verification Status
        emailNotVerified: 'Adresse email non vérifiée',
        phoneNotVerified: 'Numéro de téléphone non vérifié',
        verified: 'Vérifié',

        // Color Names
        blue: 'Bleu',
        purple: 'Violet',
        green: 'Vert',
        red: 'Rouge',
        orange: 'Orange',
        pink: 'Rose',

        // Size Names
        small: 'Petit',
        medium: 'Moyen',
        large: 'Grand',

        // Image Management
        eventImages: 'Images de l\'Événement',
        bannerImage: 'Image de Bannière',
        bannerImageDescription: 'Grande image de bannière affichée en haut de votre page d\'événement',
        eventImage: 'Image de l\'Événement',
        eventImageDescription: 'Image principale affichée dans les listes et cartes d\'événements',
        noBannerImage: 'Aucune image de bannière téléchargée',
        noEventImage: 'Aucune image d\'événement téléchargée',
        changeBanner: 'Changer la Bannière',
        uploadBanner: 'Télécharger la Bannière',
        changeImage: 'Changer l\'Image',
        uploadImage: 'Télécharger l\'Image',
        uploadingImages: 'Téléchargement des images...',
        imageGuidelines: 'Directives d\'Image',
        supportedFormats: 'Formats supportés',
        maxFileSize: 'Taille maximale du fichier',
        bannerRecommended: 'Taille recommandée de la bannière',
        imageRecommended: 'Taille recommandée de l\'image',
        invalidImageFile: 'Fichier image invalide',
        imageUploadFailed: 'Échec du téléchargement de l\'image',
        imageUploadSuccess: 'Image téléchargée avec succès',
        selectImageFile: 'Sélectionner un fichier image',
        imageProcessing: 'Traitement de l\'image...',
        imagePreview: 'Aperçu de l\'image',
        removeImage: 'Supprimer l\'image',
        cropImage: 'Recadrer l\'image',
        rotateImage: 'Faire pivoter l\'image',
        imageQuality: 'Qualité de l\'image',
        compressImage: 'Compresser l\'image',
        dropImageHere: 'Déposez l\'image ici ou cliquez pour télécharger',



        // Page headers and navigation
        promoCodes: 'Codes Promo',
        createAndManageDiscountCodes: 'Créez et gérez les codes de réduction pour vos événements',
        createPromoCode: 'Créer un Code Promo',
        editPromoCode: 'Modifier le Code Promo',
        promoCodeAnalytics: 'Analyses du Code Promo',

        // Stats and metrics
        totalCodes: 'Codes Totaux',
        activeCodes: 'Codes Actifs',
        totalUses: 'Utilisations Totales',
        totalSavings: 'Économies Totales',
        topPerformingCodes: 'Codes les Plus Performants',

        // Search and filters
        searchPromoCodes: 'Rechercher des codes promo...',
        allStatus: 'Tous les Statuts',
        allScopes: 'Toutes les Portées',
        organizerWide: 'Organisateur complet',
        eventSpecific: 'Événement spécifique',
        expired: 'Expiré',
        scheduled: 'Programmé',
        usedUp: 'Épuisé',
        invalid: 'Invalide',

        // Table headers
        code: 'Code',
        details: 'Détails',
        usage: 'Utilisation',
        period: 'Période',
        actions: 'Actions',

        // Promo code properties
        formattedValue: 'Valeur de Réduction',
        minimumOrderAmount: 'Commande Min.',
        maximumDiscountAmount: 'Réduction Max.',
        currentUsage: 'Utilisation Actuelle',
        maxUsage: 'Utilisation Maximum',
        startDate: 'Date de Début',
        endDate: 'Date de Fin',

        // Actions and buttons
        copyCode: 'Copier le code',
        viewAnalytics: 'Voir les Analyses',
        refresh: 'Actualiser',

        // Status messages
        copySuccess: 'Code copié dans le presse-papiers',
        deletePromoCodeConfirm: 'Êtes-vous sûr de vouloir supprimer le code promo "{code}" ? Cette action ne peut pas être annulée.',
        promoCodeDeletedSuccessfully: 'Code promo supprimé avec succès',
        failedToDeletePromoCode: 'Échec de la suppression du code promo',
        failedToLoadPromoCodes: 'Échec du chargement des codes promo',
        loadingPromoCodes: 'Chargement des codes promo...',

        // Empty states
        noPromoCodesYet: 'Aucun code promo encore',
        createFirstPromoCode: 'Créez Votre Premier Code Promo',
        createFirstPromoCodeDescription: 'Créez votre premier code promo pour commencer à offrir des réductions',
        noPromoCodesMatchFilters: 'Aucun code promo ne correspond à vos filtres',
        adjustSearchOrFilterCriteria: 'Essayez d\'ajuster vos critères de recherche ou de filtre',

        // Scope indicators
        eventSpecificDescription: 'Événement spécifique',
        organizerWideDescription: 'Tous les événements',

        // Usage indicators
        uses: 'utilisations',

        // Date formatting
        start: 'Début',
        end: 'Fin',

        // Performance section
        topPerformingCodesDescription: 'Vos codes promo les plus performants',
        numberOne: '#1',

        // Analytics related
        viewDetailedAnalytics: 'Voir les analyses détaillées',
        promoCodePerformance: 'Performance du Code Promo',

        // Form validation and creation
        promoCodeRequired: 'Le code promo est requis',
        promoCodeFormat: 'Le code promo ne doit contenir que des lettres majuscules et des chiffres',
        discountValueRequired: 'La valeur de réduction est requise',
        maxUsageRequired: 'L\'utilisation maximum est requise',
        startDateRequired: 'La date de début est requise',
        endDateRequired: 'La date de fin est requise',
        endDateAfterStartDate: 'La date de fin doit être postérieure à la date de début',

        // Type indicators
        percentageOff: '% de réduction',
        fixedAmountOff: '$ de réduction',

        // Create/Edit specific
        basicSettings: 'Paramètres de Base',
        discountSettings: 'Paramètres de Réduction',
        scopeSettings: 'Paramètres de Portée',
        usageSettings: 'Paramètres d\'Utilisation',
        advancedSettings: 'Paramètres Avancés',

        // Success messages
        promoCodeCreatedSuccessfully: 'Code promo créé avec succès !',
        promoCodeUpdatedSuccessfully: 'Code promo mis à jour avec succès !',

        // Error messages
        failedToCreatePromoCode: 'Échec de la création du code promo',
        failedToUpdatePromoCode: 'Échec de la mise à jour du code promo',
        cannotEditUsedPromoCode: 'Impossible de modifier un code promo qui a été utilisé',

        // Analytics specific
        usageByDay: 'Utilisation par Jour',
        usageByEvent: 'Utilisation par Événement',
        conversionRate: 'Taux de Conversion',
        averageDiscount: 'Réduction Moyenne',
        totalOrderValue: 'Valeur Totale de la Commande',

        // Status descriptions
        activeDescription: 'Actuellement actif et disponible',
        inactiveDescription: 'Désactivé et non disponible',
        expiredDescription: 'Passé la date de fin',
        scheduledDescription: 'Pas encore actif, commence dans le futur',

        editing: 'Modification',
        used: 'utilisé',
        discountType: 'Type de Réduction',
        typeCannotBeChanged: 'Le type ne peut pas être modifié après la création',
        codeCannotBeChanged: 'Le code ne peut pas être modifié après la création',
        optionalDescriptionReference: 'Description optionnelle pour référence interne',
        orderMustBeAtLeast: 'La commande doit être au moins de ce montant pour utiliser le code promo',
        capMaximumDiscount: 'Limiter le montant maximum de réduction pour les codes basés sur un pourcentage',
        promoCodeScope: 'Portée du Code Promo',
        scopeCannotBeChanged: 'La portée ne peut pas être modifiée après la création',
        maxUsagePerUser: 'Utilisation Maximum par Utilisateur',
        limitUsagePerUser: 'Limiter le nombre de fois que chaque utilisateur peut utiliser ce code promo',
        statusSettings: 'Paramètres de Statut',
        activeStatus: 'Statut Actif',
        inactivePromoCodesNote: 'Les codes promo inactifs ne peuvent pas être utilisés par les clients',
        promoCodeWillBeDeactivated: 'Ce code promo sera désactivé et ne pourra pas être utilisé par les clients.',
        editingGuidelines: 'Directives de Modification',
        cannotEdit: 'Ne Peut Pas Modifier',
        descriptionAndNotes: 'Description et notes',
        endDateExtendOnly: 'Date de fin (prolonger seulement)',
        maxUsageIncreaseOnly: 'Utilisation max (augmenter seulement)',
        activeInactiveStatus: 'Statut actif/inactif',
        promoCodeItself: 'Le code promo lui-même',
        discountTypeAndValue: 'Type et valeur de réduction (si utilisé)',
        scopeAndEventAssignment: 'Portée et assignation d\'événement',
        anyFieldIfUsed: 'Tout champ si le code a été utilisé',
        changesEffectNote: 'Les modifications des dates et limites prennent effet immédiatement. Les codes promo avec utilisation existante sont protégés pour maintenir l\'intégrité de l\'historique d\'achat.',
        hide: 'Masquer',
        show: 'Afficher',
        preview: 'Aperçu',


        codeCannotBeChangedAfterCreation: 'Le code ne peut pas être modifié après la création',
        optionalDescriptionForInternalReference: 'Description optionnelle pour référence interne',
        typeCannotBeChangedAfterCreation: 'Le type ne peut pas être modifié après la création',
        scopeCannotBeChangedAfterCreation: 'La portée ne peut pas être modifiée après la création',
        orderMustBeAtLeastThisAmount: 'La commande doit être d\'au moins ce montant pour utiliser le code promo',
        capMaximumDiscountAmountForPercentage: 'Plafonner le montant maximum de remise pour les codes basés sur un pourcentage',
        limitHowManyTimesEachUserCanUse: 'Limiter le nombre de fois que chaque utilisateur peut utiliser ce code promo',
        inactivePromoCodesCannotBeUsed: 'Les codes promo inactifs ne peuvent pas être utilisés par les clients',
        promoCodeHasBeenUsedTimes: 'Ce code promo a été utilisé {count} fois',
        editingDisabledToPreserveIntegrity: 'La modification est désactivée pour préserver l\'intégrité des données d\'achat',
        performanceInsights: 'Statistiques de Performance',
        usageRate: 'Taux d\'Utilisation',
        timesUsed: 'Fois Utilisé',
        promoCodeHasBeenUsedAndLocked: 'Ce code promo a été utilisé et est verrouillé pour modification afin de maintenir l\'intégrité de l\'historique d\'achat',
        changesEffectImmediately: 'Les modifications des dates et limites prennent effet immédiatement',
        currentUsageCannotReduceBelow: 'Utilisation actuelle : {count} (ne peut pas être réduite en dessous)',
        discountValueMustBePositive: 'La valeur de remise doit être un nombre positif',
        percentageValueCannotExceed100: 'La valeur du pourcentage ne peut pas dépasser 100%',
        fixedAmountCannotExceed10000: 'Le montant fixe ne peut pas dépasser 10 000 $',
        startDateCannotBeInPast: 'La date de début ne peut pas être dans le passé',
        endDateCannotBeMoreThan2Years: 'La date de fin ne peut pas être plus de 2 ans après la date de début',
        maximumUsageCountCannotExceed10000: 'Le nombre maximum d\'utilisations ne peut pas dépasser 10 000',
        minimumOrderAmountCannotExceed100000: 'Le montant minimum de commande ne peut pas dépasser 100 000 $',
        maximumDiscountAmountCannotExceed10000: 'Le montant maximum de remise ne peut pas dépasser 10 000 $',
        maximumDiscountCannotExceedValue: 'La remise maximum ne peut pas dépasser la valeur de remise',
        maxUsagePerUserCannotExceed100: 'L\'utilisation maximum par utilisateur ne peut pas dépasser 100',
        showAdvancedOptions: 'Afficher les Paramètres Avancés',
        hideAdvancedOptions: 'Masquer les Paramètres Avancés',
        warning: 'Avertissement',

        dateandusagesettings: 'Paramètres de Date et d\'Utilisation',
        maximumusage: 'Utilisation Maximale',
        maximumusageperusers: 'Utilisation Maximale par Utilisateur',
        detailedPerformanceMetrics: 'Métriques de Performance Détaillées',

        totalDiscountsGiven: 'Total des Remises Accordées',

        overview: 'Aperçu',
        usagehistory: 'Historique d\'Utilisation',
        timeline: 'Chronologie',
        customersavings: 'Économies des Clients',

        totalrevenueimpact: 'Impact Total sur les Revenus',
        statustext: 'Statut',
        analyticsInformation: 'Informations d\'Analyse',
        metricsIncluded: 'Métriques Incluses',

        usageHistory: "Historique d'Utilisation",
        promoCodeNotUsedYet: "Code Promo Pas Encore Utilisé",
        promoCodeDetails: "Détails du Code Promo",
        usedCount: "Nombre d'Utilisations",
        orderValue: "Valeur de Commande",
        ofMaximumUsage: "de l'Utilisation Maximum",
        discount: "Remise",
        usageHistoryShowsAll: "L'Historique d'Utilisation Montre Tout",
        timelineDataAggregated: "Données de Chronologie Agrégées",
        revenueImpactAnalysis: "Analyse d'Impact sur les Revenus",
        realTimeUsageTracking: "Suivi d'Utilisation en Temps Réel",
        historicalDataPreserved: "Données Historiques Préservées",
        eventSpecificPerformance: "Performance Spécifique à l'Événement",
        dataUpdates: "Mises à Jour des Données",
        customerBehaviorInsights: "Insights sur le Comportement Client",
        conversionRatesCalculated: "Taux de Conversion Calculés",
        analyticsUpdateRealTime: "Mise à Jour Analytics en Temps Réel",
        analyticsDataUpdatedImmediately: "Données Analytics Mises à Jour Immédiatement",
        allMonetaryValuesUSD: "Toutes les Valeurs Monétaires en USD",

        customer: "Client",
        order: "Commande",
        subtotal: "Sous-total",
        date: "Date",

        thispromohasntbeenused: "Ce code promo n'a pas encore été utilisé",
        nousageyet: "Aucune utilisation encore",
        notimelinedata: "Aucune donnée de chronologie disponible",
        usageTimelineMessage: "La chronologie d'utilisation apparaîtra une fois que les clients commenceront à utiliser ce code promo.",
        peakDay: 'Jour de Pointe',
        averageDaily: 'Moyenne Quotidienne',
        activeDays: 'Jours Actifs',
        noTimelineData: 'Aucune donnée de chronologie disponible',
        timelineWillAppear: 'La chronologie d\'utilisation apparaîtra une fois que les clients commenceront à utiliser ce code promo.',
        analyticsNotFound: 'Analytics introuvable',
        unableToLoadAnalytics: 'Impossible de charger les analytics pour ce code promo.',

        retry: 'Réessayer',
        loadingAnalytics: 'Chargement des analytics...',
        unknown: 'Inconnu',
        backToPromoCodes: '',

        //attendee
        noimagesavailable: 'Aucune image disponible',
        loadingevents: 'Chargement des événements...',

        // Hero Section
        discoverEvents: "Découvrir des Événements",
        eventsAcrossCategories: "événements dans {count} catégories",
        searchPlaceholder: "Rechercher événements, lieux, organisateurs...",
        filters: "Filtres",

        // Gallery
        galleryShowcase: "Galerie de Présentation",
        featuredEventsAndVenues: "Événements et lieux en vedette",

        // Event Cards
        today: "Aujourd'hui !",
        tomorrow: "Demain",
        soon: "Bientôt !",
        inDays: "Dans {days} jours",
        limited: "Limité !",
        from: "À partir de",
        viewAndBook: "Voir et Réserver",
        at: "à",

        // Sections
        searchResults: "Résultats de Recherche",
        resultsFor: "Résultats pour \"{term}\"",
        exploreAllEvents: "Explorer tous les événements",
        premierVenues: "Lieux Premier",
        topEventLocations: "Principaux lieux d'événements",
        hot: "Tendance",
        popular: "Populaire",



        // Actions
        myTickets: "Mes Billets",
        signIn: "Se Connecter",
        clearFilters: "Effacer les Filtres",


        // Empty States

        noEventsAvailable: "Aucun événement disponible",
        tryAdjustingSearch: "Essayez d'ajuster votre recherche",
        eventsWillAppearSoon: "Les événements apparaîtront ici bientôt",

        // Footer
        quickLinks: "Liens Rapides",
        browseEvents: "Explorer les Événements",
        becomeAnOrganizer: "Devenir Organisateur",
        contactUs: "Nous Contacter",
        support: "Support",
        helpCenter: "Centre d'Aide",
        faq: "FAQ",
        contactSupport: "Contacter le Support",
        privacyPolicy: "Politique de Confidentialité",
        termsOfService: "Conditions de Service",
        stayUpdated: "Restez Informé",
        enterYourEmail: "Entrez votre email",
        availableWorldwide: "Disponible dans le Monde Entier",

        // Additional
        scheduleText: "Horaire",
        featuredEvents: "Événements en Vedette",
        categories: "Catégories",

        clearSearch: "Effacer la recherche",
        ticketsavailable: "Billets disponibles",

        // Add to French translations (fr):
        by: 'Par',
        eventsHosted: 'événements organisés',
        yourPremierDestination: 'Votre destination de choix pour découvrir et réserver des événements extraordinaires.',
        connectWithExperiences: 'Connectez-vous avec des expériences qui vous tiennent à cœur.',
        home: 'Accueil',
        eventStreet: '123 Rue de l\'Événement',
        shahAlam: 'Shah Alam, Selangor 40150',
        malaysia: 'Malaisie',
        monFriHours: 'Lun - Ven : 9h00 - 18h00',
        satSunHours: 'Sam - Dim : 10h00 - 16h00',
        allRightsReserved: 'Tous droits réservés',
        eventBanner: 'Bannière de l\'Événement',
        eventGallery: 'Galerie de l\'Événement',
        eventNotFound: 'Événement Non Trouvé',
        backToEvents: 'Retour aux Événements',
        featured: 'En Vedette',
        aboutThisEvent: 'À Propos de Cet Événement',
        onlineEventNote: 'Cet événement se déroulera en ligne. Les détails d\'accès seront fournis après l\'achat.',
        eventOrganizer: 'Organisateur de l\'Événement',
        venueInformation: 'Informations sur le Lieu',
        visitWebsite: 'Visiter le Site Web',
        inYourCart: 'Dans Votre Panier',
        items: 'articles',
        remove: 'Supprimer',
        total: 'Total',
        getTickets: 'Obtenir des Billets',
        available: 'Disponibles',
        noTicketsAvailable: 'Aucun billet disponible encore',
        maxPerOrder: 'Max {max} par commande',
        addToCart: 'Ajouter au Panier',
        soldOut: 'Épuisé',
        notAvailable: 'Non Disponible',
        proceedToCheckout: 'Procéder au Checkout',

        manageTickets: 'Voir et gérer tous vos billets d\'événements',
        valid: 'Valide',
        cancelled: 'Annulé',
        upcoming: 'À venir',
        pastEvents: 'Événements Passés',
        attended: 'Événements Assistés',
        download: 'Télécharger',
        attendeeInformation: 'Informations du Participant',
        purchaseDetails: 'Détails d\'Achat',
        purchaseDate: 'Date d\'Achat',
        checkInDate: 'Date d\'Enregistrement',
        viewEventDetails: 'Voir les Détails de l\'Événement',

        // Order confirmation and profile specific translations
        orderNotFound: 'Commande introuvable',
        purchaseSuccessful: 'Achat Réussi !',
        ticketsConfirmedSentEmail: 'Vos billets ont été confirmés et envoyés à votre email.',
        eventDetails: 'Détails de l\'Événement',
        orderDetails: 'Détails de la Commande',
        orderNumber: 'Numéro de Commande',
        totalAmount: 'Montant Total',
        orderDate: 'Date de Commande',
        yourTickets: 'Vos Billets',
        ticketsCount: '{count} billet(s)',
        qrCode: 'Code QR',
        importantNotice: 'Avis Important',
        bringTicketsAndId: 'Veuillez apporter vos billets (imprimés ou sur mobile) et une pièce d\'identité valide à l\'événement. Les codes QR seront scannés à l\'entrée.',
        viewMyTickets: 'Voir Mes Billets',
        browseMoreEvents: 'Parcourir Plus d\'Événements',
        checkEmailForDetails: 'Vérifiez votre email pour les billets détaillés et les informations de l\'événement.',
        downloadData: 'Télécharger Mes Données',
        defaultTimeZone: 'Fuseau Horaire par Défaut pour les Événements',
        serviceFee: 'Frais de Service',
        tax: 'Taxe',

        completePurchase: 'Compléter l\'Achat',
        minutes: 'minutes',
        hours: 'heures',
        hour: 'heures',

        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche',

        jan: 'Janvier',
        feb: 'Février',
        mar: 'Mars',
        apr: 'Avril',
        may: 'Mai',
        jun: 'Juin',
        jul: 'Juillet',
        aug: 'Août',
        sep: 'Septembre',
        oct: 'Octobre',
        nov: 'Novembre',
        dec: 'Décembre',

        
    },
    // German translations
    de: {
        // Common
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        view: 'Anzeigen',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        confirm: 'Bestätigen',
        back: 'Zurück',
        create: 'Erstellen',
        update: 'Aktualisieren',

        // Navigation
        dashboard: 'Dashboard',
        events: 'Veranstaltungen',
        settings: 'Einstellungen',
        profile: 'Profil',
        logout: 'Abmelden',

        // Settings
        personalInformation: 'Persönliche Informationen',
        organization: 'Organisation',
        notifications: 'Benachrichtigungen',
        security: 'Sicherheit',
        appearance: 'Erscheinungsbild',
        language: 'Sprache',
        preferences: 'Einstellungen',

        // Profile
        firstName: 'Vorname',
        lastName: 'Nachname',
        email: 'E-Mail',
        phoneNumber: 'Telefonnummer',
        companyName: 'Firmenname',
        address: 'Adresse',
        city: 'Stadt',
        state: 'Bundesland',
        zipCode: 'Postleitzahl',
        country: 'Land',

        // Events
        createEvent: 'Veranstaltung erstellen',
        editEvent: 'Veranstaltung bearbeiten',
        eventTitle: 'Veranstaltungstitel',
        eventDescription: 'Veranstaltungsbeschreibung',
        eventDate: 'Veranstaltungsdatum',
        eventTime: 'Veranstaltungszeit',
        eventLocation: 'Veranstaltungsort',
        ticketPrice: 'Ticketpreis',
        yourEvents: 'Ihre Veranstaltungen',
        createYourFirstEvent: 'Erstellen Sie Ihre erste Veranstaltung',
        createFirstEventPrompt: 'Erstellen Sie Ihre erste Veranstaltung, um mit EventPro zu beginnen.',
        eventsSubtitle: 'Verwalten Sie Ihre Veranstaltungen und verfolgen Sie ihre Leistung',
        allEvents: 'Alle Veranstaltungen',
        unpublished: 'Unveröffentlicht',
        searchEvents: 'Veranstaltungen suchen...',
        noDescriptionAvailable: 'Keine Beschreibung verfügbar',
        dateNotSet: 'Datum nicht festgelegt',
        invalidDate: 'Ungültiges Datum',
        timeNotSet: 'Zeit nicht festgelegt',
        invalidTime: 'Ungültige Zeit',
        confirmDeleteEvent: 'Sind Sie sicher, dass Sie "{title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedToDeleteEvent: 'Fehler beim Löschen der Veranstaltung',
        failedToTogglePublish: 'Fehler beim {action} der Veranstaltung',
        noEventsMatchSearch: 'Keine Veranstaltungen entsprechen Ihrer Suche',
        adjustSearchCriteria: 'Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen',

        // Event Form
        createNewEvent: 'Neue Veranstaltung erstellen',
        editEventDetails: 'Veranstaltung bearbeiten',
        fillEventDetails: 'Füllen Sie die Details aus, um Ihre Veranstaltung zu erstellen',
        updateEventDetails: 'Aktualisieren Sie die Details Ihrer Veranstaltung',
        basicInformation: 'Grundinformationen',
        eventTitleRequired: 'Veranstaltungstitel ist erforderlich',
        enterEventTitle: 'Veranstaltungstitel eingeben',
        descriptionRequired: 'Veranstaltungsbeschreibung ist erforderlich',
        describeEventDetail: 'Beschreiben Sie Ihre Veranstaltung im Detail...',
        categoryRequired: 'Kategorie ist erforderlich',
        selectCategory: 'Kategorie auswählen',
        maxCapacityRequired: 'Maximale Kapazität muss größer als 0 sein',
        maximumAttendees: 'Maximale Teilnehmerzahl',
        eventImageUrl: 'Veranstaltungsbild-URL',
        enterImageUrl: 'https://beispiel.com/veranstaltungsbild.jpg',

        // Date & Time
        dateTime: 'Datum & Zeit',
        multiDayEvent: 'Mehrtägige Veranstaltung: {count} Tage',
        dayEvent: '{count}-tägige Veranstaltung',
        startDateTime: 'Startdatum & -zeit',
        startDateTimeRequired: 'Startdatum der Veranstaltung ist erforderlich',
        endDateTime: 'Enddatum & -zeit',
        leaveEmptySingleSession: 'Leer lassen für einsitzige Veranstaltungen',
        endDateAfterStart: 'Enddatum muss nach dem Startdatum liegen',
        registrationDeadline: 'Anmeldefrist',
        whenRegistrationClose: 'Wann soll die Anmeldung geschlossen werden? (optional)',
        registrationDeadlineBeforeEvent: 'Anmeldefrist muss vor Veranstaltungsbeginn liegen',

        // Location
        location: 'Ort',
        onlineEvent: 'Dies ist eine Online-Veranstaltung',
        venueRequired: 'Veranstaltungsort ist für Präsenzveranstaltungen erforderlich',
        selectVenue: 'Veranstaltungsort auswählen',
        locationDetails: 'Ortsdetails',
        meetingLinkPlatform: 'Meeting-Link oder Plattformdetails',
        additionalLocationInfo: 'Zusätzliche Ortsinformationen',

        // Ticket Types
        ticketTypes: 'Tickettypen',
        addTicketType: 'Tickettyp hinzufügen',
        ticketTypesCount: 'Tickettypen',
        totalTypes: 'Gesamttypen',
        editable: 'Bearbeitbar',
        locked: 'Gesperrt',
        noTicketTypesYet: 'Noch keine Tickettypen',
        addTicketTypesToStart: 'Fügen Sie Tickettypen hinzu, um mit dem Verkauf von Tickets für Ihre Veranstaltung zu beginnen',
        createFirstTicketType: 'Ersten Tickettyp erstellen',
        ticketTypeName: 'Ticketname',
        ticketTypeNameRequired: 'Ticketname ist erforderlich',
        ticketDescription: 'Beschreibung',
        optionalTicketDescription: 'Optionale Beschreibung für diesen Tickettyp',
        price: 'Preis ',
        priceRequired: 'Gültiger Preis ist erforderlich',
        quantity: 'Menge',
        quantityRequired: 'Ticketmenge muss größer als 0 sein',
        quantityGreaterThanZero: 'Menge muss größer als 0 sein',
        ticketActive: 'Aktiv (zum Kauf verfügbar)',
        availableForPurchase: 'Zum Kauf verfügbar',
        createTicketType: 'Tickettyp erstellen',
        updateTicketType: 'Tickettyp aktualisieren',
        editTicketType: 'Tickettyp bearbeiten',

        // Smart Editing
        smartTicketEditing: '💡 Intelligente Tickettyp-Bearbeitung',
        whenCanEdit: '✅ Wann Sie bearbeiten KÖNNEN:',
        eventDraftStatus: '• Veranstaltung ist im ENTWURF-Status',
        noTicketsSold: '• Noch keine Tickets verkauft',
        eventNotPublished: '• Veranstaltung ist nicht veröffentlicht',
        whenEditingLocked: '🔒 Wann die Bearbeitung GESPERRT ist:',
        eventIsPublished: '• Veranstaltung ist veröffentlicht',
        ticketsAlreadySold: '• Tickets wurden bereits verkauft',
        eventStatusNotDraft: '• Veranstaltungsstatus ist nicht ENTWURF',
        safeToEdit: 'Sicher zu bearbeiten - noch keine Verkäufe',
        lockedToPreserve: 'Gesperrt zur Erhaltung der Verkaufsdaten',
        ticketsSoldCount: '{count} Ticket(s) bereits verkauft. Bearbeitung ist gesperrt, um Kaufdaten zu erhalten.',
        cannotCreateTicketTypes: 'Kann keine neuen Tickettypen erstellen. {count} Ticket(s) wurden bereits verkauft.',
        salesDataIntegrity: 'Veranstaltung ist veröffentlicht. Kann keine Tickettypen erstellen, um die Integrität der Verkaufsdaten zu erhalten.',

        // Publishing
        publishingOptions: 'Veröffentlichungsoptionen',
        publishEventImmediately: 'Veranstaltung sofort veröffentlichen (für die Öffentlichkeit sichtbar machen)',
        makeVisiblePublic: 'Für die Öffentlichkeit sichtbar machen',
        publishUnpublishLater: 'Sie können Ihre Veranstaltung später jederzeit vom Dashboard aus veröffentlichen oder zurückziehen',
        currentlyPublished: 'Derzeit veröffentlicht',
        currentlyUnpublished: 'Derzeit nicht veröffentlicht',
        usePublishButtons: 'Verwenden Sie die Veröffentlichen/Zurückziehen-Buttons in der Veranstaltungsliste, um diesen Status zu ändern',
        changePublishStatus: 'Veröffentlichungsstatus ändern',

        // Validation
        fixErrorsBelow: 'Bitte beheben Sie die Fehler unten',
        formValidationError: 'Bitte beheben Sie Formularfehler',
        requiredField: 'Dieses Feld ist erforderlich',
        invalidInput: 'Ungültige Eingabe',

        // Success/Error Messages
        eventCreatedSuccessfully: 'Veranstaltung und alle Tickettypen erfolgreich erstellt!',
        eventUpdatedSuccessfully: 'Veranstaltung erfolgreich aktualisiert!',
        ticketTypeCreatedSuccessfully: 'Tickettyp erfolgreich erstellt!',
        ticketTypeUpdatedSuccessfully: 'Tickettyp erfolgreich aktualisiert!',
        failedToCreateEvent: 'Fehler beim Erstellen der Veranstaltung. Bitte versuchen Sie es erneut.',
        failedToUpdateEvent: 'Fehler beim Aktualisieren der Veranstaltung. Bitte versuchen Sie es erneut.',
        failedToCreateTicketType: 'Fehler beim Erstellen des Tickettyps',
        failedToUpdateTicketType: 'Fehler beim Aktualisieren des Tickettyps',
        creatingEvent: 'Veranstaltung wird erstellt...',
        updatingEvent: 'Veranstaltung wird aktualisiert...',
        redirectingToDashboard: 'Weiterleitung zum Dashboard...',
        redirectingToEventDetail: 'Weiterleitung zu Veranstaltungsdetails...',

        // Capacity and Venues
        capacity: 'Kapazität',
        venue: 'Veranstaltungsort',
        selectAVenue: 'Veranstaltungsort auswählen',
        venueWithCapacity: '{name} - {city} (Kapazität: {capacity})',

        // Categories
        category: 'Kategorie',
        technology: 'Technologie',
        business: 'Geschäft',
        music: 'Musik',
        sports: 'Sport',
        education: 'Bildung',

        // Event States
        published: 'Veröffentlicht',
        draft: 'Entwurf',
        online: 'Online',
        inPerson: 'Präsenz',

        // Multi-day
        multiDaySchedule: 'Mehrtägiger Zeitplan',

        // Venue Management
        venues: 'Veranstaltungsorte',
        createVenue: 'Veranstaltungsort erstellen',
        venueName: 'Name des Veranstaltungsortes',
        venueNameRequired: 'Name des Veranstaltungsortes ist erforderlich',
        enterVenueName: 'Name des Veranstaltungsortes eingeben',
        venueAddress: 'Adresse',
        addressRequired: 'Adresse ist erforderlich',
        enterVenueAddress: 'Adresse des Veranstaltungsortes eingeben',
        venueState: 'Bundesland',
        enterState: 'Bundesland eingeben',
        enterStateOptional: 'Bundesland eingeben (optional)',
        venueCountry: 'Land',
        countryRequired: 'Land ist erforderlich',
        enterCountry: 'Land eingeben',
        venueZipCode: 'Postleitzahl',
        enterZipCode: 'Postleitzahl eingeben',
        enterZipCodeOptional: 'Postleitzahl eingeben (optional)',
        capacityRequired: 'Kapazität muss größer als 0 sein',
        maximumCapacity: 'Maximale Kapazität',
        contactEmail: 'Kontakt-E-Mail',
        contactPhone: 'Kontakttelefon',
        website: 'Website',
        latitude: 'Breitengrad',
        longitude: 'Längengrad',
        description: 'Beschreibung',
        venueDescription: 'Beschreibung des Veranstaltungsortes',
        describeVenue: 'Beschreiben Sie den Veranstaltungsort, Annehmlichkeiten, besondere Merkmale...',
        venueImageUrl: 'Bild-URL des Veranstaltungsortes',
        validEmailRequired: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        latitudeBetween: 'Breitengrad muss zwischen -90 und 90 liegen',
        longitudeBetween: 'Längengrad muss zwischen -180 und 180 liegen',
        optionalMapIntegration: 'Optional: Für Kartenintegration',
        createNewVenue: 'Neuen Veranstaltungsort erstellen',
        venueCreatedSuccessfully: 'Veranstaltungsort erfolgreich erstellt!',
        failedToCreateVenue: 'Fehler beim Erstellen des Veranstaltungsortes. Bitte versuchen Sie es erneut.',
        failedToFetchVenues: 'Fehler beim Laden der Veranstaltungsorte',
        creatingVenue: 'Wird erstellt...',
        loadingVenues: 'Veranstaltungsorte werden geladen...',
        searchVenues: 'Veranstaltungsorte suchen...',
        allCities: 'Alle Städte',
        noVenuesFound: 'Keine Veranstaltungsorte gefunden',
        adjustFilters: 'Versuchen Sie, Ihre Filter anzupassen',
        getStartedFirstVenue: 'Beginnen Sie mit der Erstellung Ihres ersten Veranstaltungsortes',
        venueLocation: 'Ort',
        venueCapacity: 'Kapazität',
        venueEvents: 'Veranstaltungen',
        venueStatus: 'Status',
        active: 'Aktiv',
        inactive: 'Inaktiv',
        eventsCount: '{count} Veranstaltungen',
        viewAvailableVenues: 'Verfügbare Veranstaltungsorte anzeigen und neue erstellen',
        createNewOnes: 'Neue erstellen',

        // Ticket Management
        tickets: 'Tickets',
        ticketManagement: 'Ticket-Verwaltung',
        manageTicketTypes: 'Verwalten Sie Tickettypen, validieren Sie Tickets und bearbeiten Sie Check-ins',
        validateTickets: 'Tickets validieren',
        checkIn: 'Check-in',
        ticketValidation: 'Ticket-Validierung',
        ticketCheckIn: 'Ticket-Check-in',
        ticketsAndCheckIn: 'Tickets & Check-in',

        // Ticket Types Management
        createTicketTypeAction: 'Tickettyp erstellen',
        ticketTypeLimitations: '⚠️ Wichtig: Einschränkungen bei der Erstellung von Tickettypen',
        publishedEventsRestriction: 'Veröffentlichte Veranstaltungen: Tickettypen können nicht geändert werden, um bestehende Verkaufsdaten zu erhalten',
        eventsWithSalesRestriction: 'Veranstaltungen mit Verkäufen: Die Bearbeitung von Tickettypen wird gesperrt, sobald Tickets verkauft werden',
        draftStatusRequired: 'Für die Erstellung von Tickettypen: Veranstaltungen müssen im ENTWURF-Status ohne bestehende Verkäufe sein',
        alternativeCreateEvent: 'Alternative: Erstellen Sie eine neue Veranstaltung, wenn Sie andere Tickettypen benötigen',
        onlyWorksForDraft: 'Funktioniert nur für Entwurfs-Veranstaltungen ohne bestehende Verkäufe',
        createNewEventLink: 'Neue Veranstaltung erstellen',
        manageEventsLink: 'Veranstaltungen verwalten',

        // Ticket Form
        selectAnEvent: 'Veranstaltung auswählen',
        ticketCreationRequirements: '⚠️ Anforderungen für die Ticket-Erstellung',
        eventMustBeDraft: 'Veranstaltung muss im ENTWURF-Status sein (nicht veröffentlicht)',
        noExistingTicketSales: 'Veranstaltung darf keine bestehenden Ticketverkäufe haben',
        mustBeEventOrganizer: 'Sie müssen der Veranstaltungsorganisator sein',
        editTicketsDuringCreation: 'Falls dies fehlschlägt, bearbeiten Sie Tickettypen während der Veranstaltungserstellung',
        ticketEvent: 'Veranstaltung',
        eventRequired: 'Veranstaltung ist erforderlich',
        noEventsFound: 'Keine Veranstaltungen gefunden',
        needCreateEventFirst: 'Sie müssen zuerst eine Veranstaltung erstellen, bevor Sie Tickettypen erstellen.',

        // Ticket Types Display
        loadingTicketTypes: 'Tickettypen werden geladen...',
        noTicketTypesFound: 'Keine Tickettypen gefunden',
        adjustFiltersOrCreate: 'Versuchen Sie, Ihre Filter anzupassen oder erstellen Sie Ihren ersten Tickettyp',
        createFirstTicketTypePrompt: 'Erstellen Sie Ihren ersten Tickettyp',
        ticketType: 'Tickettyp',
        event: 'Veranstaltung',
        availability: 'Verfügbarkeit',
        status: 'Status',
        remaining: 'verbleibend',

        // Validation Tab
        validateTicket: 'Ticket validieren',
        enterTicketNumber: 'Ticketnummer eingeben',
        validating: 'Wird validiert...',
        validate: 'Validieren',
        validTicket: 'Gültiges Ticket',
        invalidTicket: 'Ungültiges Ticket',
        ticketNumber: 'Ticketnummer',
        attendeeName: 'Teilnehmer',
        alreadyUsed: 'Bereits verwendet',
        notUsed: 'Nicht verwendet',

        // Check-in Tab
        checkInTicket: 'Ticket-Check-in',
        enterTicketNumberCheckIn: 'Ticketnummer für Check-in eingeben',
        checkingIn: 'Check-in läuft...',
        ticketCheckedInSuccessfully: 'Ticket erfolgreich eingecheckt',

        // Ticket Warnings
        importantTicketLimitations: '⚠️ Wichtig: Einschränkungen bei der Erstellung von Tickettypen',
        cannotModifyPublished: '• Veröffentlichte Veranstaltungen: Tickettypen können nicht geändert werden, um bestehende Verkaufsdaten zu erhalten',
        editingLockedAfterSales: '• Veranstaltungen mit Verkäufen: Die Bearbeitung von Tickettypen wird gesperrt, sobald Tickets verkauft werden',
        draftStatusForCreation: '• Für die Erstellung von Tickettypen: Veranstaltungen müssen im ENTWURF-Status ohne bestehende Verkäufe sein',
        createNewEventAlternative: '• Alternative: Erstellen Sie eine neue Veranstaltung, wenn Sie andere Tickettypen benötigen',

        // Business Rules
        businessRulesWarning: '⚠️ Anforderungen für die Ticket-Erstellung',

        // Ticket States
        ticketInactive: 'Inaktiv',

        // General UI
        optional: 'optional',
        required: 'erforderlich',

        // Appearance
        theme: 'Design',
        lightMode: 'Heller Modus',
        darkMode: 'Dunkler Modus',
        autoMode: 'Automatischer Modus',
        accentColor: 'Akzentfarbe',
        fontSize: 'Schriftgröße',
        compactMode: 'Kompakter Modus',

        // Time and Date
        timeFormat: 'Zeitformat',
        dateFormat: 'Datumsformat',
        currency: 'Währung',
        timezone: 'Zeitzone',

        // Messages
        saveSuccess: 'Einstellungen erfolgreich gespeichert!',
        saveError: 'Fehler beim Speichern der Einstellungen',
        loadError: 'Fehler beim Laden der Daten',

        // Dashboard specific
        welcomeBack: 'Willkommen zurück',
        virtualEvent: 'Virtuelle Veranstaltung',
        viewAllEvents: 'Alle Veranstaltungen anzeigen →',
        upcomingEvents: 'Bevorstehende Veranstaltungen',
        unpublish: 'Zurückziehen',
        unlimited: 'Unbegrenzt',
        uncategorized: 'Unkategorisiert',
        totalRevenue: 'Gesamtumsatz',
        totalEvents: 'Gesamte Veranstaltungen',
        ticketsSold: 'Verkaufte Tickets',
        revenue: 'Umsatz',
        publish: 'Veröffentlichen',
        noEventsYet: 'Noch keine Veranstaltungen',
        maxCapacity: 'Maximale Kapazität',
        loadingDashboard: 'Dashboard wird geladen...',
        dashboardError: 'Fehler beim Laden der Dashboard-Daten',
        publishedCount: '{count} veröffentlicht',

        // Analytics Dashboard
        analytics: 'Analysen',
        analyticsSubtitle: 'Umfassende Einblicke für Ihre Veranstaltungen',
        comprehensiveInsights: 'Umfassende Einblicke für Ihre Veranstaltungen',
        refreshData: 'Aktualisieren',
        someDataCouldntBeLoaded: 'Einige Daten konnten nicht geladen werden:',

        // Key Metrics
        totalAttendees: 'Gesamtteilnehmer',
        activeEvents: 'Aktive Veranstaltungen',
        venuesUsed: 'Verwendete Veranstaltungsorte',
        fromLastMonth: 'vom letzten Monat',
        noRevenueYet: 'Noch kein Umsatz',
        noAttendeesYet: 'Noch keine Teilnehmer',
        eventsRunning: 'Laufende Veranstaltungen',
        noActiveEvents: 'Keine aktiven Veranstaltungen',
        venuePartnerships: 'Veranstaltungsort-Partnerschaften',
        noVenuesYet: 'Noch keine Veranstaltungsorte',

        // Charts and Analytics
        topRevenueEvents: 'Umsatzstärkste Veranstaltungen',
        noEventsWithRevenueData: 'Noch keine Veranstaltungen mit Umsatzdaten',
        createAndPublishEvents: 'Erstellen und veröffentlichen Sie Veranstaltungen',
        seeRevenueAnalytics: 'um Umsatzanalysen zu sehen',
        paymentMethodDistribution: 'Verteilung der Zahlungsmethoden',
        noPaymentDataAvailable: 'Keine Zahlungsdaten verfügbar',
        eventCapacityUtilization: 'Kapazitätsauslastung der Veranstaltungen',
        utilizationPercentage: 'Auslastung',
        noEventsFoundForPeriod: 'Keine Veranstaltungen für den gewählten Zeitraum gefunden',
        monthlyTrends: 'Monatliche Trends',

        // Demographics
        genderDistribution: 'Geschlechterverteilung',
        noDemographicDataAvailable: 'Keine demografischen Daten verfügbar',
        venuePerformance: 'Veranstaltungsort-Performance',
        avgAttendance: 'Durchschnittliche Teilnahme',
        noVenueDataAvailable: 'Keine Veranstaltungsort-Daten verfügbar',

        // Events Needing Attention
        eventsNeedingAttention: 'Veranstaltungen, die Aufmerksamkeit benötigen',
        utilization: 'Auslastung',
        daysUntilEvent: 'Tage bis zur Veranstaltung',
        potentialIssues: 'Mögliche Probleme:',
        recommendations: 'Empfehlungen:',
        allEventsPerformingWell: 'Alle Veranstaltungen laufen gut!',
        noEventsWithLowAttendance: 'Keine Veranstaltungen mit geringer Teilnahme gefunden',

        // Time periods
        last7Days: 'Letzte 7 Tage',
        last30Days: 'Letzte 30 Tage',
        last3Months: 'Letzte 3 Monate',
        last6Months: 'Letzte 6 Monate',
        lastYear: 'Letztes Jahr',

        // Status messages
        checkingAuthentication: 'Authentifizierung wird überprüft...',
        authenticationRequired: 'Authentifizierung erforderlich',
        pleaseLogInToView: 'Bitte melden Sie sich an, um das Analyse-Dashboard zu sehen.',
        goToLogin: 'Zur Anmeldung',

        // Orders and remaining
        orders: 'Bestellungen',
        // Organization Settings
        organizationInformation: 'Organisationsinformationen',
        businessLicense: 'Gewerbeschein',

        // Notification Settings
        emailNotifications: 'E-Mail-Benachrichtigungen',
        smsNotifications: 'SMS-Benachrichtigungen',
        newBookings: 'Neue Buchungen',
        getNotifiedNewBooking: 'Benachrichtigung erhalten, wenn jemand Ihre Veranstaltung bucht',
        cancellations: 'Stornierungen',
        getNotifiedCancellations: 'Benachrichtigung erhalten, wenn Buchungen storniert werden',
        lowInventoryNotifications: 'Benachrichtigungen bei niedrigem Bestand',
        dailyReports: 'Tägliche Berichte',
        receiveDailySummary: 'Tägliche Zusammenfassung von Buchungen und Umsätzen erhalten',
        weeklyReports: 'Wöchentliche Berichte',
        receiveWeeklyAnalytics: 'Wöchentliche Analysen und Einblicke erhalten',
        monthlyReports: 'Monatliche Berichte',

        // Security Settings
        securitySettings: 'Sicherheitseinstellungen',
        twoFactorAuthentication: 'Zwei-Faktor-Authentifizierung',
        addExtraLayerSecurity: 'Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu',
        loginNotifications: 'Anmelde-Benachrichtigungen',
        getNotifiedNewLogins: 'Benachrichtigung bei neuen Anmeldeversuchen erhalten',
        sessionTimeout: 'Sitzungszeitüberschreitung',
        sessionTimeoutMinutes: 'Sitzungszeitüberschreitung (Minuten)',

        // Password Settings
        changePassword: 'Passwort ändern',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        confirmNewPassword: 'Neues Passwort bestätigen',
        minimumCharacters: 'Mindestens 6 Zeichen',
        passwordsDoNotMatch: 'Die neuen Passwörter stimmen nicht überein',
        passwordTooShort: 'Das neue Passwort muss mindestens 6 Zeichen lang sein',
        changingPassword: 'Passwort wird geändert...',
        passwordChanged: 'Passwort erfolgreich geändert',

        // Event Default Settings
        eventDefaults: 'Standard-Veranstaltungseinstellungen',
        defaultEventDuration: 'Standard-Veranstaltungsdauer',
        defaultEventDurationMinutes: 'Standard-Veranstaltungsdauer (Minuten)',
        ticketSaleStart: 'Ticketverkaufsstart',
        ticketSaleStartDays: 'Ticketverkaufsstart (Tage vor der Veranstaltung)',
        defaultRefundPolicy: 'Standard-Rückerstattungsrichtlinie',
        requireApproval: 'Genehmigung erforderlich',
        requireApprovalBeforeLive: 'Genehmigung vor Veröffentlichung erforderlich',
        autoPublish: 'Automatische Veröffentlichung',
        autoPublishWhenCreated: 'Veranstaltungen bei Erstellung automatisch veröffentlichen',

        // Language & Region Settings
        languageRegion: 'Sprache & Region',
        languagePreferences: 'Spracheinstellungen und regionale Formate',
        regionalFormats: 'Regionale Formate',
        interfaceLanguage: 'Oberflächensprache',
        timeDateFormats: 'Zeit- und Datumsformate',
        currencySettings: 'Währungseinstellungen',
        livePreview: 'Live-Vorschau',

        // Time Format Settings
        hour12Format: '12-Stunden-Format',
        hour24Format: '24-Stunden-Format',

        // Date Format Settings
        dateFormatExample: 'Beispiel: {example}',

        // Display Settings
        displaySettings: 'Anzeigeeinstellungen',
        fontSizeSmall: 'Klein',
        fontSizeMedium: 'Mittel',
        fontSizeLarge: 'Groß',
        reduceSpacing: 'Abstand zwischen Elementen reduzieren',

        // Theme Settings
        themeSettings: 'Design-Einstellungen',
        choosePreferredTheme: 'Wählen Sie Ihr bevorzugtes Oberflächendesign',
        cleanBrightInterface: 'Saubere und helle Oberfläche',
        easyOnEyes: 'Augenschonend',
        followsSystemPreference: 'Folgt Systemeinstellung',
        accentColorSettings: 'Akzentfarbe',
        chooseAccentColor: 'Wählen Sie Ihre bevorzugte Akzentfarbe',

        // Success Messages
        settingsSavedSuccessfully: 'Einstellungen erfolgreich gespeichert!',
        profileUpdatedSuccessfully: 'Profil erfolgreich aktualisiert!',
        organizationUpdatedSuccessfully: 'Organisation erfolgreich aktualisiert!',
        preferencesUpdatedSuccessfully: 'Einstellungen erfolgreich aktualisiert!',

        // Error Messages
        failedToUpdateProfile: 'Fehler beim Aktualisieren des Profils',
        failedToUpdateOrganization: 'Fehler beim Aktualisieren der Organisation',
        failedToUpdatePreferences: 'Fehler beim Aktualisieren der Einstellungen',
        failedToChangePassword: 'Fehler beim Ändern des Passworts',

        // Loading States
        loadingProfile: 'Profil wird geladen...',
        savingChanges: 'Änderungen werden gespeichert...',

        // Authentication (already exists as authenticationRequired, but adding full context)
        pleaseLoginToAccess: 'Bitte melden Sie sich an, um auf Ihre Einstellungen zuzugreifen.',

        // General Settings
        manageAccount: 'Verwalten Sie Ihr Konto und Ihre Veranstaltungseinstellungen',
        eventPreferences: 'Veranstaltungseinstellungen',
        saved: 'Gespeichert!',
        saveChanges: 'Änderungen speichern',

        // Verification Status
        emailNotVerified: 'E-Mail-Adresse nicht verifiziert',
        phoneNotVerified: 'Telefonnummer nicht verifiziert',
        verified: 'Verifiziert',

        // Color Names (for dynamic translation)
        blue: 'Blau',
        purple: 'Violett',
        green: 'Grün',
        red: 'Rot',
        orange: 'Orange',
        pink: 'Rosa',

        // Size Names (already exist as small, medium, large but adding for consistency)
        small: 'Klein',
        medium: 'Mittel',
        large: 'Groß',

        // Image Management
        eventImages: 'Veranstaltungsbilder',
        bannerImage: 'Banner-Bild',
        bannerImageDescription: 'Großes Banner-Bild, das oben auf Ihrer Veranstaltungsseite angezeigt wird',
        eventImage: 'Veranstaltungsbild',
        eventImageDescription: 'Hauptbild, das in Veranstaltungslisten und -karten angezeigt wird',
        noBannerImage: 'Kein Banner-Bild hochgeladen',
        noEventImage: 'Kein Veranstaltungsbild hochgeladen',
        changeBanner: 'Banner Ändern',
        uploadBanner: 'Banner Hochladen',
        changeImage: 'Bild Ändern',
        uploadImage: 'Bild Hochladen',
        uploadingImages: 'Bilder werden hochgeladen...',
        imageGuidelines: 'Bild-Richtlinien',
        supportedFormats: 'Unterstützte Formate',
        maxFileSize: 'Maximale Dateigröße',
        bannerRecommended: 'Empfohlene Banner-Größe',
        imageRecommended: 'Empfohlene Bildgröße',
        invalidImageFile: 'Ungültige Bilddatei',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        imageUploadSuccess: 'Bild erfolgreich hochgeladen',
        selectImageFile: 'Bilddatei auswählen',
        imageProcessing: 'Bild wird verarbeitet...',
        imagePreview: 'Bildvorschau',
        removeImage: 'Bild entfernen',
        cropImage: 'Bild zuschneiden',
        rotateImage: 'Bild drehen',
        imageQuality: 'Bildqualität',
        compressImage: 'Bild komprimieren',
        dropImageHere: 'Ziehen Sie Ihr Bild hierher oder klicken Sie zum Hochladen',


        // Page headers and navigation
        promoCodes: 'Promo-Codes',
        createAndManageDiscountCodes: 'Erstellen und verwalten Sie Rabattcodes für Ihre Veranstaltungen',
        createPromoCode: 'Promo-Code Erstellen',
        editPromoCode: 'Promo-Code Bearbeiten',
        promoCodeAnalytics: 'Promo-Code Analysen',

        // Stats and metrics
        totalCodes: 'Codes Gesamt',
        activeCodes: 'Aktive Codes',
        totalUses: 'Gesamtnutzungen',
        totalSavings: 'Gesamtersparnis',
        topPerformingCodes: 'Beste Codes',

        // Search and filters
        searchPromoCodes: 'Promo-Codes suchen...',
        allStatus: 'Alle Status',
        allScopes: 'Alle Bereiche',
        organizerWide: 'Organisator-weit',
        eventSpecific: 'Veranstaltungsspezifisch',
        expired: 'Abgelaufen',
        scheduled: 'Geplant',
        usedUp: 'Aufgebraucht',
        invalid: 'Ungültig',

        // Table headers
        code: 'Code',
        details: 'Details',
        usage: 'Nutzung',
        period: 'Zeitraum',
        actions: 'Aktionen',

        // Promo code properties
        formattedValue: 'Rabattwert',
        minimumOrderAmount: 'Min. Bestellung',
        maximumDiscountAmount: 'Max. Rabatt',
        currentUsage: 'Aktuelle Nutzung',
        maxUsage: 'Max. Nutzung',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        // Actions and buttons
        copyCode: 'Code kopieren',
        viewAnalytics: 'Analysen Anzeigen',
        refresh: 'Aktualisieren',

        // Status messages
        copySuccess: 'Code in Zwischenablage kopiert',
        deletePromoCodeConfirm: 'Sind Sie sicher, dass Sie den Promo-Code "{code}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        promoCodeDeletedSuccessfully: 'Promo-Code erfolgreich gelöscht',
        failedToDeletePromoCode: 'Fehler beim Löschen des Promo-Codes',
        failedToLoadPromoCodes: 'Fehler beim Laden der Promo-Codes',
        loadingPromoCodes: 'Promo-Codes werden geladen...',

        // Empty states
        noPromoCodesYet: 'Noch keine Promo-Codes',
        createFirstPromoCode: 'Erstellen Sie Ihren Ersten Promo-Code',
        createFirstPromoCodeDescription: 'Erstellen Sie Ihren ersten Promo-Code, um Rabatte anzubieten',
        noPromoCodesMatchFilters: 'Keine Promo-Codes entsprechen Ihren Filtern',
        adjustSearchOrFilterCriteria: 'Versuchen Sie, Ihre Such- oder Filterkriterien anzupassen',

        // Scope indicators
        eventSpecificDescription: 'Veranstaltungsspezifisch',
        organizerWideDescription: 'Alle Veranstaltungen',

        // Usage indicators
        uses: 'Nutzungen',

        // Date formatting
        start: 'Start',
        end: 'Ende',

        // Performance section
        topPerformingCodesDescription: 'Ihre erfolgreichsten Promo-Codes',
        numberOne: '#1',

        // Analytics related
        viewDetailedAnalytics: 'Detaillierte Analysen anzeigen',
        promoCodePerformance: 'Promo-Code Leistung',

        // Form validation and creation
        promoCodeRequired: 'Promo-Code ist erforderlich',
        promoCodeFormat: 'Promo-Code darf nur Großbuchstaben und Zahlen enthalten',
        discountValueRequired: 'Rabattwert ist erforderlich',
        maxUsageRequired: 'Maximale Nutzung ist erforderlich',
        startDateRequired: 'Startdatum ist erforderlich',
        endDateRequired: 'Enddatum ist erforderlich',
        endDateAfterStartDate: 'Enddatum muss nach dem Startdatum liegen',

        // Type indicators
        percentageOff: '% Rabatt',
        fixedAmountOff: '$ Rabatt',

        // Create/Edit specific
        basicSettings: 'Grundeinstellungen',
        discountSettings: 'Rabatteinstellungen',
        scopeSettings: 'Bereichseinstellungen',
        usageSettings: 'Nutzungseinstellungen',
        advancedSettings: 'Erweiterte Einstellungen',

        // Success messages
        promoCodeCreatedSuccessfully: 'Promo-Code erfolgreich erstellt!',
        promoCodeUpdatedSuccessfully: 'Promo-Code erfolgreich aktualisiert!',

        // Error messages
        failedToCreatePromoCode: 'Fehler beim Erstellen des Promo-Codes',
        failedToUpdatePromoCode: 'Fehler beim Aktualisieren des Promo-Codes',
        cannotEditUsedPromoCode: 'Bereits verwendeter Promo-Code kann nicht bearbeitet werden',

        // Analytics specific
        usageByDay: 'Nutzung pro Tag',
        usageByEvent: 'Nutzung pro Veranstaltung',
        conversionRate: 'Konversionsrate',
        averageDiscount: 'Durchschnittlicher Rabatt',
        totalOrderValue: 'Gesamtbestellwert',

        // Status descriptions
        activeDescription: 'Derzeit aktiv und verfügbar',
        inactiveDescription: 'Deaktiviert und nicht verfügbar',
        expiredDescription: 'Nach dem Enddatum',
        scheduledDescription: 'Noch nicht aktiv, startet in der Zukunft',

        editing: 'Bearbeitung',
        used: 'verwendet',
        discountType: 'Rabatt-Typ',
        typeCannotBeChanged: 'Der Typ kann nach der Erstellung nicht geändert werden',
        codeCannotBeChanged: 'Der Code kann nach der Erstellung nicht geändert werden',
        optionalDescriptionReference: 'Optionale Beschreibung für interne Referenz',
        orderMustBeAtLeast: 'Bestellung muss mindestens diesen Betrag haben, um den Promo-Code zu verwenden',
        capMaximumDiscount: 'Maximalen Rabattbetrag für prozentbasierte Codes begrenzen',
        promoCodeScope: 'Promo-Code Bereich',
        scopeCannotBeChanged: 'Der Bereich kann nach der Erstellung nicht geändert werden',
        maxUsagePerUser: 'Maximale Nutzung pro Benutzer',
        limitUsagePerUser: 'Begrenzen, wie oft jeder Benutzer diesen Promo-Code verwenden kann',
        statusSettings: 'Status-Einstellungen',
        activeStatus: 'Aktiver Status',
        inactivePromoCodesNote: 'Inaktive Promo-Codes können nicht von Kunden verwendet werden',
        promoCodeWillBeDeactivated: 'Dieser Promo-Code wird deaktiviert und kann nicht von Kunden verwendet werden.',
        editingGuidelines: 'Bearbeitungsrichtlinien',
        cannotEdit: 'Kann Nicht Bearbeiten',
        descriptionAndNotes: 'Beschreibung und Notizen',
        endDateExtendOnly: 'Enddatum (nur verlängern)',
        maxUsageIncreaseOnly: 'Max. Nutzung (nur erhöhen)',
        activeInactiveStatus: 'Aktiv/inaktiv Status',
        promoCodeItself: 'Der Promo-Code selbst',
        discountTypeAndValue: 'Rabatt-Typ und -Wert (falls verwendet)',
        scopeAndEventAssignment: 'Bereich und Event-Zuordnung',
        anyFieldIfUsed: 'Jedes Feld, falls Code verwendet wurde',
        changesEffectNote: 'Änderungen an Daten und Limits werden sofort wirksam. Promo-Codes mit bestehender Nutzung sind geschützt, um die Integrität der Kaufhistorie zu bewahren.',
        hide: 'Verbergen',
        show: 'Anzeigen',
        preview: 'Vorschau',


        codeCannotBeChangedAfterCreation: 'Code kann nach der Erstellung nicht geändert werden',
        optionalDescriptionForInternalReference: 'Optionale Beschreibung für interne Referenz',
        typeCannotBeChangedAfterCreation: 'Typ kann nach der Erstellung nicht geändert werden',
        scopeCannotBeChangedAfterCreation: 'Bereich kann nach der Erstellung nicht geändert werden',
        orderMustBeAtLeastThisAmount: 'Bestellung muss mindestens diesen Betrag haben, um den Promocode zu verwenden',
        capMaximumDiscountAmountForPercentage: 'Maximalen Rabattbetrag für prozentbasierte Codes begrenzen',
        limitHowManyTimesEachUserCanUse: 'Begrenzen, wie oft jeder Benutzer diesen Promocode verwenden kann',
        inactivePromoCodesCannotBeUsed: 'Inaktive Promocodes können nicht von Kunden verwendet werden',
        promoCodeHasBeenUsedTimes: 'Dieser Promocode wurde {count} Mal verwendet',
        editingDisabledToPreserveIntegrity: 'Bearbeitung ist deaktiviert, um die Integrität der Kaufdaten zu bewahren',
        performanceInsights: 'Leistungseinblicke',
        usageRate: 'Nutzungsrate',
        timesUsed: 'Mal Verwendet',
        promoCodeHasBeenUsedAndLocked: 'Dieser Promocode wurde verwendet und ist für die Bearbeitung gesperrt, um die Integrität der Kaufhistorie zu erhalten',
        changesEffectImmediately: 'Änderungen an Daten und Limits treten sofort in Kraft',
        currentUsageCannotReduceBelow: 'Aktuelle Nutzung: {count} (kann nicht darunter reduziert werden)',
        discountValueMustBePositive: 'Rabattwert muss eine positive Zahl sein',
        percentageValueCannotExceed100: 'Prozentwert kann 100% nicht überschreiten',
        fixedAmountCannotExceed10000: 'Fester Betrag kann $10.000 nicht überschreiten',
        startDateCannotBeInPast: 'Startdatum kann nicht in der Vergangenheit liegen',
        endDateCannotBeMoreThan2Years: 'Enddatum kann nicht mehr als 2 Jahre vom Startdatum entfernt sein',
        maximumUsageCountCannotExceed10000: 'Maximale Nutzungsanzahl kann 10.000 nicht überschreiten',
        minimumOrderAmountCannotExceed100000: 'Mindestbestellbetrag kann $100.000 nicht überschreiten',
        maximumDiscountAmountCannotExceed10000: 'Maximaler Rabattbetrag kann $10.000 nicht überschreiten',
        maximumDiscountCannotExceedValue: 'Maximaler Rabatt kann den Rabattwert nicht überschreiten',
        maxUsagePerUserCannotExceed100: 'Maximale Nutzung pro Benutzer kann 100 nicht überschreiten',
        showAdvancedOptions: 'Erweiterte Einstellungen Anzeigen',
        hideAdvancedOptions: 'Erweiterte Einstellungen Ausblenden',
        warning: 'Warnung',


        dateandusagesettings: 'Datum- und Nutzungseinstellungen',
        maximumusage: 'Maximale Nutzung',
        maximumusageperusers: 'Maximale Nutzung pro Benutzer',
        detailedPerformanceMetrics: 'Detaillierte Leistungsmetriken',

        totalDiscountsGiven: 'Gesamte gewährte Rabatte',

        overview: 'Übersicht',
        usagehistory: 'Nutzungshistorie',
        timeline: 'Zeitleiste',
        customersavings: 'Kundeneinsparungen',

        totalrevenueimpact: 'Gesamter Umsatz-Einfluss',

        statustext: 'Bestellung bestätigt',

        analyticsInformation: 'Analytik-Informationen',
        metricsIncluded: 'Die Metriken umfassen:',

        usageHistory: "Nutzungshistorie",
        promoCodeNotUsedYet: "Promocode Noch Nicht Verwendet",
        promoCodeDetails: "Promocode-Details",
        usedCount: "Verwendungsanzahl",
        orderValue: "Bestellwert",
        ofMaximumUsage: "von Maximaler Nutzung",
        discount: "Rabatt",
        usageHistoryShowsAll: "Nutzungshistorie Zeigt Alles",
        timelineDataAggregated: "Zeitachsen-Daten Aggregiert",
        revenueImpactAnalysis: "Umsatz-Impact-Analyse",
        realTimeUsageTracking: "Echtzeit-Nutzungsverfolgung",
        historicalDataPreserved: "Historische Daten Erhalten",
        eventSpecificPerformance: "Ereignisspezifische Leistung",
        dataUpdates: "Datenaktualisierungen",
        customerBehaviorInsights: "Kundenverhalten-Einblicke",
        conversionRatesCalculated: "Konversionsraten Berechnet",
        analyticsUpdateRealTime: "Analytics-Update Echtzeit",
        analyticsDataUpdatedImmediately: "Analytics-Daten Sofort Aktualisiert",
        allMonetaryValuesUSD: "Alle Geldwerte in USD",

        customer: "Kunde",
        order: "Bestellung",
        subtotal: "Zwischensumme",
        date: "Datum",

        thispromohasntbeenused: "Dieser Promo-Code wurde noch nicht verwendet",
        nousageyet: "Keine Nutzung bisher",
        notimelinedata: "Keine Zeitachsen-Daten verfügbar",
        usageTimelineMessage: "Die Nutzungs-Zeitachse wird angezeigt, sobald Kunden diesen Promocode verwenden.",
        peakDay: 'Jour de Pointe',
        averageDaily: 'Moyenne Quotidienne',
        activeDays: 'Jours Actifs',
        noTimelineData: 'Aucune donnée de chronologie disponible',
        timelineWillAppear: 'La chronologie d\'utilisation apparaîtra une fois que les clients commenceront à utiliser ce code promo.',
        analyticsNotFound: 'Analytics introuvable',
        unableToLoadAnalytics: 'Impossible de charger les analytics pour ce code promo.',

        retry: 'Erneut versuchen',
        loadingAnalytics: 'Analytics werden geladen...',
        unknown: 'Unbekannt',
        backToPromoCodes: '',

        //attendee
        noimagesavailable: 'Keine Bilder verfügbar',
        loadingevents: 'Veranstaltungen werden geladen...',

        // Hero Section
        discoverEvents: "Veranstaltungen Entdecken",
        eventsAcrossCategories: "Veranstaltungen in {count} Kategorien",
        searchPlaceholder: "Events, Locations, Veranstalter suchen...",
        filters: "Filter",

        // Gallery
        galleryShowcase: "Galerie-Showcase",
        featuredEventsAndVenues: "Hervorgehobene Events und Locations",

        // Event Cards
        today: "Heute!",
        tomorrow: "Morgen",
        soon: "Bald!",
        inDays: "In {days} Tagen",
        limited: "Begrenzt!",
        from: "Ab",
        viewAndBook: "Ansehen & Buchen",
        at: "um",

        // Sections
        searchResults: "Suchergebnisse",
        resultsFor: "Ergebnisse für \"{term}\"",
        exploreAllEvents: "Alle Events erkunden",
        premierVenues: "Premium-Locations",
        topEventLocations: "Top Event-Locations",
        hot: "Angesagt",
        popular: "Beliebt",



        // Actions
        myTickets: "Meine Tickets",
        signIn: "Anmelden",
        clearFilters: "Filter Löschen",


        // Empty States
        noEventsAvailable: "Keine Events verfügbar",
        tryAdjustingSearch: "Versuchen Sie, Ihre Suche anzupassen",
        eventsWillAppearSoon: "Events werden hier bald erscheinen",

        // Footer
        quickLinks: "Schnelllinks",
        browseEvents: "Events Durchsuchen",
        becomeAnOrganizer: "Veranstalter Werden",
        contactUs: "Kontakt",
        support: "Support",
        helpCenter: "Hilfe-Center",
        faq: "FAQ",
        contactSupport: "Support Kontaktieren",
        privacyPolicy: "Datenschutzrichtlinie",
        termsOfService: "Nutzungsbedingungen",
        stayUpdated: "Auf dem Laufenden Bleiben",
        enterYourEmail: "Geben Sie Ihre E-Mail ein",
        availableWorldwide: "Weltweit Verfügbar",

        // Additional
        scheduleText: "Zeitplan",
        featuredEvents: "Hervorgehobene Events",
        categories: "Kategorien",

        clearSearch: "Suche Löschen",
        ticketsavailable: "Tickets Verfügbar",

        // Add to German translations (de):
        by: 'Von',
        eventsHosted: 'Veranstaltungen ausgerichtet',
        yourPremierDestination: 'Ihr erstklassiges Ziel für die Entdeckung und Buchung fantastischer Events.',
        connectWithExperiences: 'Verbinden Sie sich mit Erfahrungen, die Ihnen wichtig sind.',
        home: 'Startseite',
        eventStreet: '123 Event Straße',
        shahAlam: 'Shah Alam, Selangor 40150',
        malaysia: 'Malaysia',
        monFriHours: 'Mo - Fr: 9:00 - 18:00',
        satSunHours: 'Sa - So: 10:00 - 16:00',
        allRightsReserved: 'Alle Rechte vorbehalten',
        eventBanner: 'Veranstaltungs-Banner',
        eventGallery: 'Veranstaltungs-Galerie',
        eventNotFound: 'Veranstaltung Nicht Gefunden',
        backToEvents: 'Zurück zu Veranstaltungen',
        featured: 'Hervorgehoben',
        aboutThisEvent: 'Über Diese Veranstaltung',
        onlineEventNote: 'Diese Veranstaltung findet online statt. Zugangsdaten werden nach dem Kauf bereitgestellt.',
        eventOrganizer: 'Veranstaltungsorganisator',
        venueInformation: 'Veranstaltungsort-Informationen',
        visitWebsite: 'Website Besuchen',
        inYourCart: 'In Ihrem Warenkorb',
        items: 'Artikel',
        remove: 'Entfernen',
        total: 'Gesamt',
        getTickets: 'Tickets Erhalten',
        available: 'Verfügbar',
        noTicketsAvailable: 'Noch keine Tickets verfügbar',
        maxPerOrder: 'Max {max} pro Bestellung',
        addToCart: 'In den Warenkorb',
        soldOut: 'Ausverkauft',
        notAvailable: 'Nicht Verfügbar',
        proceedToCheckout: 'Zur Kasse',

        manageTickets: 'Alle Ihre Event-Tickets anzeigen und verwalten',
        valid: 'Gültig',
        cancelled: 'Storniert',
        upcoming: 'Bevorstehend',
        pastEvents: 'Vergangene Veranstaltungen',
        attended: 'Besuchte Veranstaltungen',
        download: 'Herunterladen',
        attendeeInformation: 'Teilnehmer-Informationen',
        purchaseDetails: 'Kaufdetails',
        purchaseDate: 'Kaufdatum',
        checkInDate: 'Check-in Datum',
        viewEventDetails: 'Veranstaltungsdetails anzeigen',

        // Order confirmation and profile specific translations
        orderNotFound: 'Bestellung nicht gefunden',
        purchaseSuccessful: 'Kauf Erfolgreich!',
        ticketsConfirmedSentEmail: 'Ihre Tickets wurden bestätigt und an Ihre E-Mail gesendet.',
        eventDetails: 'Veranstaltungsdetails',
        orderDetails: 'Bestelldetails',
        orderNumber: 'Bestellnummer',
        totalAmount: 'Gesamtbetrag',
        orderDate: 'Bestelldatum',
        yourTickets: 'Ihre Tickets',
        ticketsCount: '{count} Ticket(s)',
        qrCode: 'QR-Code',
        importantNotice: 'Wichtiger Hinweis',
        bringTicketsAndId: 'Bitte bringen Sie Ihre Tickets (gedruckt oder auf dem Handy) und einen gültigen Ausweis zur Veranstaltung mit. QR-Codes werden am Eingang gescannt.',
        viewMyTickets: 'Meine Tickets Anzeigen',
        browseMoreEvents: 'Weitere Veranstaltungen Durchsuchen',
        checkEmailForDetails: 'Überprüfen Sie Ihre E-Mail für detaillierte Tickets und Veranstaltungsinformationen.',
        downloadData: 'Meine Daten Herunterladen',
        defaultTimeZone: 'Standard-Zeitzone für Veranstaltungen',
        serviceFee: 'Servicegebühr',
        tax: 'Steuer',

        completePurchase: 'Kauf Abschließen',
        minutes: 'Minuten',
        hours: 'Stunden',
        hour: 'Stunde',

        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag',

        jan: 'Januar',
        feb: 'Februar',
        mar: 'März',
        apr: 'April',
        may: 'Mai',
        jun: 'Juni',
        jul: 'Juli',
        aug: 'August',
        sep: 'September',
        oct: 'Oktober',
        nov: 'November',
        dec: 'Dezember',

    },
    // Italian translations
    it: {
        // Common
        save: 'Salva',
        cancel: 'Annulla',
        delete: 'Elimina',
        edit: 'Modifica',
        view: 'Visualizza',
        loading: 'Caricamento...',
        error: 'Errore',
        success: 'Successo',
        confirm: 'Conferma',
        back: 'Indietro',
        create: 'Crea',
        update: 'Aggiorna',

        // Navigation
        dashboard: 'Dashboard',
        events: 'Eventi',
        settings: 'Impostazioni',
        profile: 'Profilo',
        logout: 'Disconnetti',

        // Settings
        personalInformation: 'Informazioni personali',
        organization: 'Organizzazione',
        notifications: 'Notifiche',
        security: 'Sicurezza',
        appearance: 'Aspetto',
        language: 'Lingua',
        preferences: 'Preferenze',

        // Profile
        firstName: 'Nome',
        lastName: 'Cognome',
        email: 'Email',
        phoneNumber: 'Numero di telefono',
        companyName: 'Nome dell\'azienda',
        address: 'Indirizzo',
        city: 'Città',
        state: 'Stato',
        zipCode: 'Codice postale',
        country: 'Paese',

        // Events
        createEvent: 'Crea evento',
        editEvent: 'Modifica evento',
        eventTitle: 'Titolo dell\'evento',
        eventDescription: 'Descrizione dell\'evento',
        eventDate: 'Data dell\'evento',
        eventTime: 'Ora dell\'evento',
        eventLocation: 'Luogo dell\'evento',
        ticketPrice: 'Prezzo del biglietto',
        yourEvents: 'I tuoi eventi',
        createYourFirstEvent: 'Crea il tuo primo evento',
        createFirstEventPrompt: 'Crea il tuo primo evento per iniziare con EventPro.',
        eventsSubtitle: 'Gestisci i tuoi eventi e monitora le loro prestazioni',
        allEvents: 'Tutti gli eventi',
        unpublished: 'Non pubblicato',
        searchEvents: 'Cerca eventi...',
        noDescriptionAvailable: 'Nessuna descrizione disponibile',
        dateNotSet: 'Data non impostata',
        invalidDate: 'Data non valida',
        timeNotSet: 'Ora non impostata',
        invalidTime: 'Ora non valida',
        confirmDeleteEvent: 'Sei sicuro di voler eliminare "{title}"? Questa azione non può essere annullata.',
        failedToDeleteEvent: 'Impossibile eliminare l\'evento',
        failedToTogglePublish: 'Impossibile {action} l\'evento',
        noEventsMatchSearch: 'Nessun evento corrisponde alla tua ricerca',
        adjustSearchCriteria: 'Prova ad aggiustare i tuoi criteri di ricerca o filtro',

        // Event Form
        createNewEvent: 'Crea nuovo evento',
        editEventDetails: 'Modifica evento',
        fillEventDetails: 'Compila i dettagli per creare il tuo evento',
        updateEventDetails: 'Aggiorna i dettagli del tuo evento',
        basicInformation: 'Informazioni di base',
        eventTitleRequired: 'Il titolo dell\'evento è obbligatorio',
        enterEventTitle: 'Inserisci il titolo dell\'evento',
        descriptionRequired: 'La descrizione dell\'evento è obbligatoria',
        describeEventDetail: 'Descrivi il tuo evento in dettaglio...',
        categoryRequired: 'La categoria è obbligatoria',
        selectCategory: 'Seleziona categoria',
        maxCapacityRequired: 'La capacità massima deve essere maggiore di 0',
        maximumAttendees: 'Numero massimo di partecipanti',
        eventImageUrl: 'URL immagine evento',
        enterImageUrl: 'https://esempio.com/immagine-evento.jpg',

        // Date & Time
        dateTime: 'Data e ora',
        multiDayEvent: 'Evento di più giorni: {count} giorni',
        dayEvent: 'Evento di {count} giorno',
        startDateTime: 'Data e ora di inizio',
        startDateTimeRequired: 'La data di inizio dell\'evento è obbligatoria',
        endDateTime: 'Data e ora di fine',
        leaveEmptySingleSession: 'Lascia vuoto per eventi a sessione singola',
        endDateAfterStart: 'La data di fine deve essere dopo la data di inizio',
        registrationDeadline: 'Scadenza registrazione',
        whenRegistrationClose: 'Quando dovrebbe chiudersi la registrazione? (opzionale)',
        registrationDeadlineBeforeEvent: 'La scadenza della registrazione deve essere prima dell\'inizio dell\'evento',

        // Location
        location: 'Luogo',
        onlineEvent: 'Questo è un evento online',
        venueRequired: 'Il luogo è obbligatorio per eventi in presenza',
        selectVenue: 'Seleziona luogo',
        locationDetails: 'Dettagli del luogo',
        meetingLinkPlatform: 'Link della riunione o dettagli della piattaforma',
        additionalLocationInfo: 'Informazioni aggiuntive sul luogo',

        // Ticket Types
        ticketTypes: 'Tipi di biglietto',
        addTicketType: 'Aggiungi tipo di biglietto',
        ticketTypesCount: 'Tipi di biglietto',
        totalTypes: 'Tipi totali',
        editable: 'Modificabile',
        locked: 'Bloccato',
        noTicketTypesYet: 'Nessun tipo di biglietto ancora',
        addTicketTypesToStart: 'Aggiungi tipi di biglietto per iniziare a vendere biglietti per il tuo evento',
        createFirstTicketType: 'Crea primo tipo di biglietto',
        ticketTypeName: 'Nome biglietto',
        ticketTypeNameRequired: 'Il nome del biglietto è obbligatorio',
        ticketDescription: 'Descrizione',
        optionalTicketDescription: 'Descrizione opzionale per questo tipo di biglietto',
        price: 'Prezzo ',
        priceRequired: 'È richiesto un prezzo valido',
        quantity: 'Quantità',
        quantityRequired: 'La quantità di biglietti deve essere maggiore di 0',
        quantityGreaterThanZero: 'La quantità deve essere maggiore di 0',
        ticketActive: 'Attivo (disponibile per l\'acquisto)',
        availableForPurchase: 'Disponibile per l\'acquisto',
        createTicketType: 'Crea tipo di biglietto',
        updateTicketType: 'Aggiorna tipo di biglietto',
        editTicketType: 'Modifica tipo di biglietto',

        // Smart Editing
        smartTicketEditing: '💡 Modifica intelligente dei tipi di biglietto',
        whenCanEdit: '✅ Quando PUOI modificare:',
        eventDraftStatus: '• L\'evento è in stato BOZZA',
        noTicketsSold: '• Nessun biglietto venduto ancora',
        eventNotPublished: '• L\'evento non è pubblicato',
        whenEditingLocked: '🔒 Quando la modifica è BLOCCATA:',
        eventIsPublished: '• L\'evento è pubblicato',
        ticketsAlreadySold: '• I biglietti sono già stati venduti',
        eventStatusNotDraft: '• Lo stato dell\'evento non è BOZZA',
        safeToEdit: 'Sicuro da modificare - nessuna vendita ancora',
        lockedToPreserve: 'Bloccato per preservare i dati di vendita',
        ticketsSoldCount: '{count} biglietto/i già venduto/i. La modifica è bloccata per preservare i dati di acquisto.',
        cannotCreateTicketTypes: 'Impossibile creare nuovi tipi di biglietto. {count} biglietto/i sono già stati venduti.',
        salesDataIntegrity: 'L\'evento è pubblicato. Impossibile creare tipi di biglietto per preservare l\'integrità dei dati di vendita.',

        // Publishing
        publishingOptions: 'Opzioni di pubblicazione',
        publishEventImmediately: 'Pubblica evento immediatamente (rendilo visibile al pubblico)',
        makeVisiblePublic: 'Rendilo visibile al pubblico',
        publishUnpublishLater: 'Puoi sempre pubblicare o annullare la pubblicazione del tuo evento più tardi dalla dashboard',
        currentlyPublished: 'Attualmente pubblicato',
        currentlyUnpublished: 'Attualmente non pubblicato',
        usePublishButtons: 'Usa i pulsanti pubblica/annulla pubblicazione nell\'elenco eventi per cambiare questo stato',
        changePublishStatus: 'Cambia stato di pubblicazione',

        // Validation
        fixErrorsBelow: 'Si prega di correggere gli errori sotto',
        formValidationError: 'Si prega di correggere gli errori del modulo',
        requiredField: 'Questo campo è obbligatorio',
        invalidInput: 'Input non valido',

        // Success/Error Messages
        eventCreatedSuccessfully: 'Evento e tutti i tipi di biglietto creati con successo!',
        eventUpdatedSuccessfully: 'Evento aggiornato con successo!',
        ticketTypeCreatedSuccessfully: 'Tipo di biglietto creato con successo!',
        ticketTypeUpdatedSuccessfully: 'Tipo di biglietto aggiornato con successo!',
        failedToCreateEvent: 'Impossibile creare l\'evento. Si prega di riprovare.',
        failedToUpdateEvent: 'Impossibile aggiornare l\'evento. Si prega di riprovare.',
        failedToCreateTicketType: 'Impossibile creare il tipo di biglietto',
        failedToUpdateTicketType: 'Impossibile aggiornare il tipo di biglietto',
        creatingEvent: 'Creazione evento...',
        updatingEvent: 'Aggiornamento evento...',
        redirectingToDashboard: 'Reindirizzamento alla dashboard...',
        redirectingToEventDetail: 'Reindirizzamento ai dettagli dell\'evento...',

        // Capacity and Venues
        capacity: 'Capacità',
        venue: 'Luogo',
        selectAVenue: 'Seleziona un luogo',
        venueWithCapacity: '{name} - {city} (Capacità: {capacity})',

        // Categories
        category: 'Categoria',
        technology: 'Tecnologia',
        business: 'Business',
        music: 'Musica',
        sports: 'Sport',
        education: 'Educazione',

        // Event States
        published: 'Pubblicato',
        draft: 'Bozza',
        online: 'Online',
        inPerson: 'In presenza',

        // Multi-day
        multiDaySchedule: 'Programma multi-giorno',

        // Venue Management
        venues: 'Luoghi',
        createVenue: 'Crea luogo',
        venueName: 'Nome del luogo',
        venueNameRequired: 'Il nome del luogo è obbligatorio',
        enterVenueName: 'Inserisci il nome del luogo',
        venueAddress: 'Indirizzo',
        addressRequired: 'L\'indirizzo è obbligatorio',
        enterVenueAddress: 'Inserisci l\'indirizzo del luogo',
        venueState: 'Stato',
        enterState: 'Inserisci lo stato',
        enterStateOptional: 'Inserisci lo stato (opzionale)',
        venueCountry: 'Paese',
        countryRequired: 'Il paese è obbligatorio',
        enterCountry: 'Inserisci il paese',
        venueZipCode: 'Codice postale',
        enterZipCode: 'Inserisci il codice postale',
        enterZipCodeOptional: 'Inserisci il codice postale (opzionale)',
        capacityRequired: 'La capacità deve essere maggiore di 0',
        maximumCapacity: 'Capacità massima',
        contactEmail: 'Email di contatto',
        contactPhone: 'Telefono di contatto',
        website: 'Sito web',
        latitude: 'Latitudine',
        longitude: 'Longitudine',
        description: 'Descrizione',
        venueDescription: 'Descrizione del luogo',
        describeVenue: 'Descrivi il luogo, i servizi, le caratteristiche speciali...',
        venueImageUrl: 'URL immagine del luogo',
        validEmailRequired: 'Si prega di inserire un indirizzo email valido',
        latitudeBetween: 'La latitudine deve essere tra -90 e 90',
        longitudeBetween: 'La longitudine deve essere tra -180 e 180',
        optionalMapIntegration: 'Opzionale: Per l\'integrazione delle mappe',
        createNewVenue: 'Crea nuovo luogo',
        venueCreatedSuccessfully: 'Luogo creato con successo!',
        failedToCreateVenue: 'Impossibile creare il luogo. Si prega di riprovare.',
        failedToFetchVenues: 'Impossibile caricare i luoghi',
        creatingVenue: 'Creazione...',
        loadingVenues: 'Caricamento luoghi...',
        searchVenues: 'Cerca luoghi...',
        allCities: 'Tutte le città',
        noVenuesFound: 'Nessun luogo trovato',
        adjustFilters: 'Prova ad aggiustare i tuoi filtri',
        getStartedFirstVenue: 'Inizia creando il tuo primo luogo',
        venueLocation: 'Posizione',
        venueCapacity: 'Capacità',
        venueEvents: 'Eventi',
        venueStatus: 'Stato',
        active: 'Attivo',
        inactive: 'Inattivo',
        eventsCount: '{count} eventi',
        viewAvailableVenues: 'Visualizza luoghi disponibili e creane di nuovi',
        createNewOnes: 'Creane di nuovi',

        // Ticket Management
        tickets: 'Biglietti',
        ticketManagement: 'Gestione biglietti',
        manageTicketTypes: 'Gestisci tipi di biglietto, valida biglietti e gestisci check-in',
        validateTickets: 'Valida biglietti',
        checkIn: 'Check-in',
        ticketValidation: 'Validazione biglietti',
        ticketCheckIn: 'Check-in biglietti',
        ticketsAndCheckIn: 'Biglietti e check-in',

        // Ticket Types Management
        createTicketTypeAction: 'Crea tipo di biglietto',
        ticketTypeLimitations: '⚠️ Importante: Limitazioni nella creazione dei tipi di biglietto',
        publishedEventsRestriction: 'Eventi pubblicati: I tipi di biglietto non possono essere modificati per preservare i dati di vendita esistenti',
        eventsWithSalesRestriction: 'Eventi con vendite: La modifica dei tipi di biglietto è bloccata una volta che i biglietti sono venduti',
        draftStatusRequired: 'Per la creazione di tipi di biglietto: Gli eventi devono essere in stato BOZZA senza vendite esistenti',
        alternativeCreateEvent: 'Alternativa: Crea un nuovo evento se hai bisogno di tipi di biglietto diversi',
        onlyWorksForDraft: 'Funziona solo per eventi in bozza senza vendite esistenti',
        createNewEventLink: 'Crea nuovo evento',
        manageEventsLink: 'Gestisci eventi',

        // Ticket Form
        selectAnEvent: 'Seleziona un evento',
        ticketCreationRequirements: '⚠️ Requisiti per la creazione di biglietti',
        eventMustBeDraft: 'L\'evento deve essere in stato BOZZA (non pubblicato)',
        noExistingTicketSales: 'L\'evento non deve avere vendite di biglietti esistenti',
        mustBeEventOrganizer: 'Devi essere l\'organizzatore dell\'evento',
        editTicketsDuringCreation: 'Se questo fallisce, modifica i tipi di biglietto durante la creazione dell\'evento',
        ticketEvent: 'Evento',
        eventRequired: 'L\'evento è obbligatorio',
        noEventsFound: 'Nessun evento trovato',
        needCreateEventFirst: 'Devi creare un evento prima di creare tipi di biglietto.',

        // Ticket Types Display
        loadingTicketTypes: 'Caricamento tipi di biglietto...',
        noTicketTypesFound: 'Nessun tipo di biglietto trovato',
        adjustFiltersOrCreate: 'Prova ad aggiustare i tuoi filtri o crea il tuo primo tipo di biglietto',
        createFirstTicketTypePrompt: 'Crea il tuo primo tipo di biglietto',
        ticketType: 'Tipo di biglietto',
        event: 'Evento',
        availability: 'Disponibilità',
        status: 'Stato',
        remaining: 'rimanenti',

        // Validation Tab
        validateTicket: 'Valida biglietto',
        enterTicketNumber: 'Inserisci il numero del biglietto',
        validating: 'Validazione...',
        validate: 'Valida',
        validTicket: 'Biglietto valido',
        invalidTicket: 'Biglietto non valido',
        ticketNumber: 'Numero biglietto',
        attendeeName: 'Partecipante',
        alreadyUsed: 'Già usato',
        notUsed: 'Non usato',

        // Check-in Tab
        checkInTicket: 'Check-in biglietto',
        enterTicketNumberCheckIn: 'Inserisci il numero del biglietto per il check-in',
        checkingIn: 'Check-in in corso...',
        ticketCheckedInSuccessfully: 'Biglietto registrato con successo',

        // Ticket Warnings
        importantTicketLimitations: '⚠️ Importante: Limitazioni nella creazione dei tipi di biglietto',
        cannotModifyPublished: '• Eventi pubblicati: I tipi di biglietto non possono essere modificati per preservare i dati di vendita esistenti',
        editingLockedAfterSales: '• Eventi con vendite: La modifica dei tipi di biglietto è bloccata una volta che i biglietti sono venduti',
        draftStatusForCreation: '• Per la creazione di tipi di biglietto: Gli eventi devono essere in stato BOZZA senza vendite esistenti',
        createNewEventAlternative: '• Alternativa: Crea un nuovo evento se hai bisogno di tipi di biglietto diversi',

        // Business Rules
        businessRulesWarning: '⚠️ Requisiti per la creazione di biglietti',

        // Ticket States
        ticketInactive: 'Inattivo',

        // General UI
        optional: 'opzionale',
        required: 'obbligatorio',

        // Appearance
        theme: 'Tema',
        lightMode: 'Modalità chiara',
        darkMode: 'Modalità scura',
        autoMode: 'Modalità automatica',
        accentColor: 'Colore accento',
        fontSize: 'Dimensione carattere',
        compactMode: 'Modalità compatta',

        // Time and Date
        timeFormat: 'Formato ora',
        dateFormat: 'Formato data',
        currency: 'Valuta',
        timezone: 'Fuso orario',

        // Messages
        saveSuccess: 'Impostazioni salvate con successo!',
        saveError: 'Impossibile salvare le impostazioni',
        loadError: 'Impossibile caricare i dati',

        // Dashboard specific
        welcomeBack: 'Bentornato',
        virtualEvent: 'Evento virtuale',
        viewAllEvents: 'Visualizza tutti gli eventi →',
        upcomingEvents: 'Eventi in arrivo',
        unpublish: 'Annulla pubblicazione',
        unlimited: 'Illimitato',
        uncategorized: 'Non categorizzato',
        totalRevenue: 'Ricavi totali',
        totalEvents: 'Eventi totali',
        ticketsSold: 'Biglietti venduti',
        revenue: 'Ricavi',
        publish: 'Pubblica',
        noEventsYet: 'Nessun evento ancora',
        maxCapacity: 'Capacità massima',
        loadingDashboard: 'Caricamento della tua dashboard...',
        dashboardError: 'Impossibile caricare i dati della dashboard',
        publishedCount: '{count} pubblicati',

        // Analytics Dashboard
        analytics: 'Analisi',
        analyticsSubtitle: 'Approfondimenti completi per i tuoi eventi',
        comprehensiveInsights: 'Approfondimenti completi per i tuoi eventi',
        refreshData: 'Aggiorna',
        someDataCouldntBeLoaded: 'Alcuni dati non sono stati caricati:',

        // Key Metrics
        totalAttendees: 'Totale partecipanti',
        activeEvents: 'Eventi attivi',
        venuesUsed: 'Luoghi utilizzati',
        fromLastMonth: 'dal mese scorso',
        noRevenueYet: 'Nessun ricavo ancora',
        noAttendeesYet: 'Nessun partecipante ancora',
        eventsRunning: 'Eventi in corso',
        noActiveEvents: 'Nessun evento attivo',
        venuePartnerships: 'Partnership con luoghi',
        noVenuesYet: 'Nessun luogo ancora',

        // Charts and Analytics
        topRevenueEvents: 'Eventi con maggiori ricavi',
        noEventsWithRevenueData: 'Nessun evento con dati sui ricavi ancora',
        createAndPublishEvents: 'Crea e pubblica eventi',
        seeRevenueAnalytics: 'per vedere le analisi dei ricavi',
        paymentMethodDistribution: 'Distribuzione metodi di pagamento',
        noPaymentDataAvailable: 'Nessun dato di pagamento disponibile',
        eventCapacityUtilization: 'Utilizzo capacità eventi',
        utilizationPercentage: 'utilizzo',
        noEventsFoundForPeriod: 'Nessun evento trovato per il periodo selezionato',
        monthlyTrends: 'Tendenze mensili',

        // Demographics
        genderDistribution: 'Distribuzione per genere',
        noDemographicDataAvailable: 'Nessun dato demografico disponibile',
        venuePerformance: 'Performance dei luoghi',
        avgAttendance: 'Partecipazione media',
        noVenueDataAvailable: 'Nessun dato sui luoghi disponibile',

        // Events Needing Attention
        eventsNeedingAttention: 'Eventi che richiedono attenzione',
        utilization: 'utilizzo',
        daysUntilEvent: 'giorni all\'evento',
        potentialIssues: 'Problemi potenziali:',
        recommendations: 'Raccomandazioni:',
        allEventsPerformingWell: 'Tutti gli eventi stanno andando bene!',
        noEventsWithLowAttendance: 'Nessun evento con bassa partecipazione trovato',

        // Time periods
        last7Days: 'Ultimi 7 giorni',
        last30Days: 'Ultimi 30 giorni',
        last3Months: 'Ultimi 3 mesi',
        last6Months: 'Ultimi 6 mesi',
        lastYear: 'Ultimo anno',

        // Status messages
        checkingAuthentication: 'Verifica autenticazione...',
        authenticationRequired: 'Autenticazione richiesta',
        pleaseLogInToView: 'Accedi per visualizzare la dashboard di analisi.',
        goToLogin: 'Vai al login',

        // Orders and remaining
        orders: 'ordini',
        // Organization Settings
        organizationInformation: 'Informazioni sull\'Organizzazione',
        businessLicense: 'Licenza Commerciale',

        // Notification Settings
        emailNotifications: 'Notifiche Email',
        smsNotifications: 'Notifiche SMS',
        newBookings: 'Nuove Prenotazioni',
        getNotifiedNewBooking: 'Ricevi notifiche quando qualcuno prenota il tuo evento',
        cancellations: 'Cancellazioni',
        getNotifiedCancellations: 'Ricevi notifiche quando le prenotazioni vengono cancellate',
        lowInventoryNotifications: 'Notifiche Inventario Basso',
        dailyReports: 'Report Giornalieri',
        receiveDailySummary: 'Ricevi un riepilogo giornaliero di prenotazioni e ricavi',
        weeklyReports: 'Report Settimanali',
        receiveWeeklyAnalytics: 'Ricevi analisi e statistiche settimanali',
        monthlyReports: 'Report Mensili',

        // Security Settings
        securitySettings: 'Impostazioni di Sicurezza',
        twoFactorAuthentication: 'Autenticazione a Due Fattori',
        addExtraLayerSecurity: 'Aggiungi un ulteriore livello di sicurezza al tuo account',
        loginNotifications: 'Notifiche di Accesso',
        getNotifiedNewLogins: 'Ricevi notifiche di nuovi tentativi di accesso',
        sessionTimeout: 'Timeout Sessione',
        sessionTimeoutMinutes: 'Timeout sessione (minuti)',

        // Password Settings
        changePassword: 'Cambia Password',
        currentPassword: 'Password Attuale',
        newPassword: 'Nuova Password',
        confirmNewPassword: 'Conferma Nuova Password',
        minimumCharacters: 'Minimo 6 caratteri',
        passwordsDoNotMatch: 'Le nuove password non corrispondono',
        passwordTooShort: 'La nuova password deve contenere almeno 6 caratteri',
        changingPassword: 'Modifica Password in corso...',
        passwordChanged: 'Password Modificata con Successo',

        // Event Default Settings
        eventDefaults: 'Impostazioni Predefinite Eventi',
        defaultEventDuration: 'Durata Predefinita Evento',
        defaultEventDurationMinutes: 'Durata predefinita evento (minuti)',
        ticketSaleStart: 'Inizio Vendita Biglietti',
        ticketSaleStartDays: 'Inizio vendita biglietti (giorni prima dell\'evento)',
        defaultRefundPolicy: 'Politica di Rimborso Predefinita',
        requireApproval: 'Richiede Approvazione',
        requireApprovalBeforeLive: 'Richiede approvazione prima della pubblicazione',
        autoPublish: 'Pubblicazione Automatica',
        autoPublishWhenCreated: 'Pubblica automaticamente gli eventi quando vengono creati',

        // Language & Region Settings
        languageRegion: 'Lingua e Regione',
        languagePreferences: 'Preferenze lingua e formati regionali',
        regionalFormats: 'Formati regionali',
        interfaceLanguage: 'Lingua Interfaccia',
        timeDateFormats: 'Formati Ora e Data',
        currencySettings: 'Impostazioni Valuta',
        livePreview: 'Anteprima Live',

        // Time Format Settings
        hour12Format: 'Formato 12 ore',
        hour24Format: 'Formato 24 ore',

        // Date Format Settings
        dateFormatExample: 'Esempio: {example}',

        // Display Settings
        displaySettings: 'Impostazioni Visualizzazione',
        fontSizeSmall: 'Piccolo',
        fontSizeMedium: 'Medio',
        fontSizeLarge: 'Grande',
        reduceSpacing: 'Riduci spaziatura tra gli elementi',

        // Theme Settings
        themeSettings: 'Impostazioni Tema',
        choosePreferredTheme: 'Scegli il tuo tema interfaccia preferito',
        cleanBrightInterface: 'Interfaccia pulita e luminosa',
        easyOnEyes: 'Riposante per gli occhi',
        followsSystemPreference: 'Segue le preferenze di sistema',
        accentColorSettings: 'Colore Accento',
        chooseAccentColor: 'Scegli il tuo colore accento preferito',

        // Success Messages
        settingsSavedSuccessfully: 'Impostazioni salvate con successo!',
        profileUpdatedSuccessfully: 'Profilo aggiornato con successo!',
        organizationUpdatedSuccessfully: 'Organizzazione aggiornata con successo!',
        preferencesUpdatedSuccessfully: 'Preferenze aggiornate con successo!',

        // Error Messages
        failedToUpdateProfile: 'Impossibile aggiornare il profilo',
        failedToUpdateOrganization: 'Impossibile aggiornare l\'organizzazione',
        failedToUpdatePreferences: 'Impossibile aggiornare le preferenze',
        failedToChangePassword: 'Impossibile cambiare la password',

        // Loading States
        loadingProfile: 'Caricamento profilo...',
        savingChanges: 'Salvataggio modifiche...',

        // Authentication (already exists as authenticationRequired, but adding full context)
        pleaseLoginToAccess: 'Accedi per accedere alle tue impostazioni.',

        // General Settings
        manageAccount: 'Gestisci il tuo account e le preferenze degli eventi',
        eventPreferences: 'Preferenze eventi',
        saved: 'Salvato!',
        saveChanges: 'Salva Modifiche',

        // Verification Status
        emailNotVerified: 'Indirizzo email non verificato',
        phoneNotVerified: 'Numero di telefono non verificato',
        verified: 'Verificato',

        // Color Names (for dynamic translation)
        blue: 'Blu',
        purple: 'Viola',
        green: 'Verde',
        red: 'Rosso',
        orange: 'Arancione',
        pink: 'Rosa',

        // Size Names (already exist but adding for consistency)
        small: 'Piccolo',
        medium: 'Medio',
        large: 'Grande',

        // Image Management
        eventImages: 'Immagini dell\'Evento',
        bannerImage: 'Immagine Banner',
        bannerImageDescription: 'Grande immagine banner visualizzata in cima alla pagina del tuo evento',
        eventImage: 'Immagine Evento',
        eventImageDescription: 'Immagine principale mostrata negli elenchi e nelle schede degli eventi',
        noBannerImage: 'Nessuna immagine banner caricata',
        noEventImage: 'Nessuna immagine evento caricata',
        changeBanner: 'Cambia Banner',
        uploadBanner: 'Carica Banner',
        changeImage: 'Cambia Immagine',
        uploadImage: 'Carica Immagine',
        uploadingImages: 'Caricamento immagini...',
        imageGuidelines: 'Linee Guida Immagini',
        supportedFormats: 'Formati supportati',
        maxFileSize: 'Dimensione massima file',
        bannerRecommended: 'Dimensione raccomandata banner',
        imageRecommended: 'Dimensione raccomandata immagine',
        invalidImageFile: 'File immagine non valido',
        imageUploadFailed: 'Caricamento immagine fallito',
        imageUploadSuccess: 'Immagine caricata con successo',
        selectImageFile: 'Seleziona file immagine',
        imageProcessing: 'Elaborazione immagine...',
        imagePreview: 'Anteprima immagine',
        removeImage: 'Rimuovi immagine',
        cropImage: 'Ritaglia immagine',
        rotateImage: 'Ruota immagine',
        imageQuality: 'Qualità immagine',
        compressImage: 'Comprimi immagine',
        dropImageHere: 'Trascina l\'immagine qui o clicca per selezionare',


        // Page headers and navigation
        promoCodes: 'Codici Promo',
        createAndManageDiscountCodes: 'Crea e gestisci codici sconto per i tuoi eventi',
        createPromoCode: 'Crea Codice Promo',
        editPromoCode: 'Modifica Codice Promo',
        promoCodeAnalytics: 'Analisi Codice Promo',

        // Stats and metrics
        totalCodes: 'Codici Totali',
        activeCodes: 'Codici Attivi',
        totalUses: 'Utilizzi Totali',
        totalSavings: 'Risparmi Totali',
        topPerformingCodes: 'Codici Più Performanti',

        // Search and filters
        searchPromoCodes: 'Cerca codici promo...',
        allStatus: 'Tutti gli Stati',
        allScopes: 'Tutti gli Ambiti',
        organizerWide: 'Organizzatore completo',
        eventSpecific: 'Evento specifico',
        expired: 'Scaduto',
        scheduled: 'Programmato',
        usedUp: 'Esaurito',
        invalid: 'Invalido',

        // Table headers
        code: 'Codice',
        details: 'Dettagli',
        usage: 'Utilizzo',
        period: 'Periodo',
        actions: 'Azioni',

        // Promo code properties
        formattedValue: 'Valore Sconto',
        minimumOrderAmount: 'Ordine Min.',
        maximumDiscountAmount: 'Sconto Max.',
        currentUsage: 'Utilizzo Attuale',
        maxUsage: 'Utilizzo Massimo',
        startDate: 'Data di Inizio',
        endDate: 'Data di Fine',

        // Actions and buttons
        copyCode: 'Copia codice',
        viewAnalytics: 'Visualizza Analisi',
        refresh: 'Aggiorna',

        // Status messages
        copySuccess: 'Codice copiato negli appunti',
        deletePromoCodeConfirm: 'Sei sicuro di voler eliminare il codice promo "{code}"? Questa azione non può essere annullata.',
        promoCodeDeletedSuccessfully: 'Codice promo eliminato con successo',
        failedToDeletePromoCode: 'Impossibile eliminare il codice promo',
        failedToLoadPromoCodes: 'Impossibile caricare i codici promo',
        loadingPromoCodes: 'Caricamento codici promo...',

        // Empty states
        noPromoCodesYet: 'Nessun codice promo ancora',
        createFirstPromoCode: 'Crea il Tuo Primo Codice Promo',
        createFirstPromoCodeDescription: 'Crea il tuo primo codice promo per iniziare a offrire sconti',
        noPromoCodesMatchFilters: 'Nessun codice promo corrisponde ai tuoi filtri',
        adjustSearchOrFilterCriteria: 'Prova ad aggiustare i tuoi criteri di ricerca o filtro',

        // Scope indicators
        eventSpecificDescription: 'Evento specifico',
        organizerWideDescription: 'Tutti gli eventi',

        // Usage indicators
        uses: 'utilizzi',

        // Date formatting
        start: 'Inizio',
        end: 'Fine',

        // Performance section
        topPerformingCodesDescription: 'I tuoi codici promo più performanti',
        numberOne: '#1',

        // Analytics related
        viewDetailedAnalytics: 'Visualizza analisi dettagliate',
        promoCodePerformance: 'Performance Codice Promo',

        // Form validation and creation
        promoCodeRequired: 'Il codice promo è richiesto',
        promoCodeFormat: 'Il codice promo deve contenere solo lettere maiuscole e numeri',
        discountValueRequired: 'Il valore dello sconto è richiesto',
        maxUsageRequired: 'L\'utilizzo massimo è richiesto',
        startDateRequired: 'La data di inizio è richiesta',
        endDateRequired: 'La data di fine è richiesta',
        endDateAfterStartDate: 'La data di fine deve essere dopo la data di inizio',

        // Type indicators
        percentageOff: '% di sconto',
        fixedAmountOff: '$ di sconto',

        // Create/Edit specific
        basicSettings: 'Impostazioni Base',
        discountSettings: 'Impostazioni Sconto',
        scopeSettings: 'Impostazioni Ambito',
        usageSettings: 'Impostazioni Utilizzo',
        advancedSettings: 'Impostazioni Avanzate',

        // Success messages
        promoCodeCreatedSuccessfully: 'Codice promo creato con successo!',
        promoCodeUpdatedSuccessfully: 'Codice promo aggiornato con successo!',

        // Error messages
        failedToCreatePromoCode: 'Impossibile creare il codice promo',
        failedToUpdatePromoCode: 'Impossibile aggiornare il codice promo',
        cannotEditUsedPromoCode: 'Impossibile modificare un codice promo che è stato utilizzato',

        // Analytics specific
        usageByDay: 'Utilizzo per Giorno',
        usageByEvent: 'Utilizzo per Evento',
        conversionRate: 'Tasso di Conversione',
        averageDiscount: 'Sconto Medio',
        totalOrderValue: 'Valore Totale Ordine',

        // Status descriptions
        activeDescription: 'Attualmente attivo e disponibile',
        inactiveDescription: 'Disattivato e non disponibile',
        expiredDescription: 'Oltre la data di fine',
        scheduledDescription: 'Non ancora attivo, inizia nel futuro',

        editing: 'Modifica',
        used: 'utilizzato',
        discountType: 'Tipo di Sconto',
        typeCannotBeChanged: 'Il tipo non può essere modificato dopo la creazione',
        codeCannotBeChanged: 'Il codice non può essere modificato dopo la creazione',
        optionalDescriptionReference: 'Descrizione opzionale per riferimento interno',
        orderMustBeAtLeast: 'L\'ordine deve essere almeno di questo importo per utilizzare il codice promo',
        capMaximumDiscount: 'Limitare l\'importo massimo di sconto per codici basati su percentuale',
        promoCodeScope: 'Ambito del Codice Promo',
        scopeCannotBeChanged: 'L\'ambito non può essere modificato dopo la creazione',
        maxUsagePerUser: 'Utilizzo Massimo per Utente',
        limitUsagePerUser: 'Limitare quante volte ogni utente può utilizzare questo codice promo',
        statusSettings: 'Impostazioni Stato',
        activeStatus: 'Stato Attivo',
        inactivePromoCodesNote: 'I codici promo inattivi non possono essere utilizzati dai clienti',
        promoCodeWillBeDeactivated: 'Questo codice promo sarà disattivato e non potrà essere utilizzato dai clienti.',
        editingGuidelines: 'Linee Guida per la Modifica',
        cannotEdit: 'Non Può Modificare',
        descriptionAndNotes: 'Descrizione e note',
        endDateExtendOnly: 'Data di fine (solo estendere)',
        maxUsageIncreaseOnly: 'Utilizzo max (solo aumentare)',
        activeInactiveStatus: 'Stato attivo/inattivo',
        promoCodeItself: 'Il codice promo stesso',
        discountTypeAndValue: 'Tipo e valore di sconto (se utilizzato)',
        scopeAndEventAssignment: 'Ambito e assegnazione evento',
        anyFieldIfUsed: 'Qualsiasi campo se il codice è stato utilizzato',
        changesEffectNote: 'Le modifiche a date e limiti hanno effetto immediato. I codici promo con utilizzo esistente sono protetti per mantenere l\'integrità della cronologia degli acquisti.',
        hide: 'Nascondi',
        show: 'Mostra',
        preview: 'Anteprima',

        codeCannotBeChangedAfterCreation: 'Code kann nach der Erstellung nicht geändert werden',
        optionalDescriptionForInternalReference: 'Optionale Beschreibung für interne Referenz',
        typeCannotBeChangedAfterCreation: 'Typ kann nach der Erstellung nicht geändert werden',
        scopeCannotBeChangedAfterCreation: 'Bereich kann nach der Erstellung nicht geändert werden',
        orderMustBeAtLeastThisAmount: 'Bestellung muss mindestens diesen Betrag haben, um den Promocode zu verwenden',
        capMaximumDiscountAmountForPercentage: 'Maximalen Rabattbetrag für prozentbasierte Codes begrenzen',
        limitHowManyTimesEachUserCanUse: 'Begrenzen, wie oft jeder Benutzer diesen Promocode verwenden kann',
        inactivePromoCodesCannotBeUsed: 'Inaktive Promocodes können nicht von Kunden verwendet werden',
        promoCodeHasBeenUsedTimes: 'Dieser Promocode wurde {count} Mal verwendet',
        editingDisabledToPreserveIntegrity: 'Bearbeitung ist deaktiviert, um die Integrität der Kaufdaten zu bewahren',
        performanceInsights: 'Leistungseinblicke',
        usageRate: 'Nutzungsrate',
        timesUsed: 'Mal Verwendet',
        promoCodeHasBeenUsedAndLocked: 'Dieser Promocode wurde verwendet und ist für die Bearbeitung gesperrt, um die Integrität der Kaufhistorie zu erhalten',
        changesEffectImmediately: 'Änderungen an Daten und Limits treten sofort in Kraft',
        currentUsageCannotReduceBelow: 'Aktuelle Nutzung: {count} (kann nicht darunter reduziert werden)',
        discountValueMustBePositive: 'Rabattwert muss eine positive Zahl sein',
        percentageValueCannotExceed100: 'Prozentwert kann 100% nicht überschreiten',
        fixedAmountCannotExceed10000: 'Fester Betrag kann $10.000 nicht überschreiten',
        startDateCannotBeInPast: 'Startdatum kann nicht in der Vergangenheit liegen',
        endDateCannotBeMoreThan2Years: 'Enddatum kann nicht mehr als 2 Jahre vom Startdatum entfernt sein',
        maximumUsageCountCannotExceed10000: 'Maximale Nutzungsanzahl kann 10.000 nicht überschreiten',
        minimumOrderAmountCannotExceed100000: 'Mindestbestellbetrag kann $100.000 nicht überschreiten',
        maximumDiscountAmountCannotExceed10000: 'Maximaler Rabattbetrag kann $10.000 nicht überschreiten',
        maximumDiscountCannotExceedValue: 'Maximaler Rabatt kann den Rabattwert nicht überschreiten',
        maxUsagePerUserCannotExceed100: 'Maximale Nutzung pro Benutzer kann 100 nicht überschreiten',
        showAdvancedOptions: 'Erweiterte Einstellungen Anzeigen',
        hideAdvancedOptions: 'Erweiterte Einstellungen Ausblenden',
        warning: 'Warnung',

        dateandusagesettings: 'Impostazioni Data e Utilizzo',
        maximumusage: 'Utilizzo Massimo',
        maximumusageperusers: 'Utilizzo Massimo per Utente',
        detailedPerformanceMetrics: 'Metriche di Prestazioni Dettagliate',
        totalDiscountsGiven: 'Totale Sconti Offerti',

        overview: 'Panoramica',
        usagehistory: 'Cronologia Utilizzo',
        timeline: 'Cronologia',
        customersavings: 'Risparmi Clienti',

        totalrevenueimpact: 'Impatto Totale sui Ricavi',

        statustext: 'Ordine confermato',
        analyticsInformation: 'Informazioni Analitiche',
        metricsIncluded: 'Le metriche includono:',

        customer: "Cliente",
        order: "Ordine",
        subtotal: "Subtotale",
        date: "Data",

        thispromohasntbeenused: 'Questo codice promo non è stato ancora utilizzato',

        nousageyet: 'Nessun utilizzo ancora',
        notimelinedata: 'Nessun dato di cronologia disponibile',

        usageTimelineMessage: "La timeline di utilizzo apparirà una volta che i clienti inizieranno a utilizzare questo codice promozionale.",

        peakDay: 'Jour de Pointe',
        averageDaily: 'Moyenne Quotidienne',
        activeDays: 'Jours Actifs',
        noTimelineData: 'Aucune donnée de chronologie disponible',
        timelineWillAppear: 'La chronologie d\'utilisation apparaîtra une fois que les clients commenceront à utiliser ce code promo.',
        analyticsNotFound: 'Analytics introuvable',
        unableToLoadAnalytics: 'Impossible de charger les analytics pour ce code promo.',
        retry: 'Riprova',
        loadingAnalytics: 'Caricamento analytics...',
        unknown: 'Sconosciuto',
        usedCount: 'Conteggio Utilizzi',
        orderValue: 'Valore Ordine',
        ofMaximumUsage: 'dell\'Utilizzo Massimo',
        discount: 'Sconto',
        promoCodeNotUsedYet: 'Questo codice promozionale non è ancora stato utilizzato da nessun cliente.',
        promoCodeDetails: 'Dettagli Codice Promozionale',
        usageHistoryShowsAll: 'La cronologia utilizzo mostra tutte le transazioni',
        timelineDataAggregated: 'Dati timeline aggregati giornalmente',
        revenueImpactAnalysis: 'Analisi impatto ricavi',
        realTimeUsageTracking: 'Tracciamento utilizzo in tempo reale',
        historicalDataPreserved: 'I dati storici vengono conservati anche se il codice promozionale viene disattivato.',
        eventSpecificPerformance: 'Performance specifica per evento',
        dataUpdates: 'Aggiornamenti dati',
        customerBehaviorInsights: 'Insights comportamento cliente',
        conversionRatesCalculated: 'Tassi di conversione calcolati automaticamente',
        analyticsUpdateRealTime: 'Analytics aggiornati in tempo reale',
        analyticsDataUpdatedImmediately: 'I dati analytics vengono aggiornati immediatamente quando i codici promozionali vengono utilizzati.',
        allMonetaryValuesUSD: 'Tutti i valori monetari sono visualizzati in USD.',
        backToPromoCodes: 'Torna ai Codici Promozionali',
        usageHistory: 'Cronologia Utilizzo',

        //attendee
        noimagesavailable: 'Nessuna immagine disponibile',
        loadingevents: 'Caricamento eventi in corso...',

        // Hero Section
        discoverEvents: "Scopri Eventi",
        eventsAcrossCategories: "eventi in {count} categorie",
        searchPlaceholder: "Cerca eventi, luoghi, organizzatori...",
        filters: "Filtri",

        // Gallery
        galleryShowcase: "Galleria in Evidenza",
        featuredEventsAndVenues: "Eventi e luoghi in evidenza",

        // Event Cards
        today: "Oggi!",
        tomorrow: "Domani",
        soon: "Presto!",
        inDays: "Tra {days} giorni",
        limited: "Limitato!",
        from: "Da",
        viewAndBook: "Visualizza e Prenota",
        at: "alle",

        // Sections
        searchResults: "Risultati di Ricerca",
        resultsFor: "Risultati per \"{term}\"",
        exploreAllEvents: "Esplora tutti gli eventi",
        premierVenues: "Luoghi Premium",
        topEventLocations: "Principali location per eventi",
        hot: "Tendenza",
        popular: "Popolare",

        // Actions
        myTickets: "I Miei Biglietti",
        signIn: "Accedi",
        clearFilters: "Cancella Filtri",

        // Empty States
        noEventsAvailable: "Nessun evento disponibile",
        tryAdjustingSearch: "Prova ad aggiustare la tua ricerca",
        eventsWillAppearSoon: "Gli eventi appariranno qui presto",

        // Footer
        quickLinks: "Link Rapidi",
        browseEvents: "Sfoglia Eventi",
        becomeAnOrganizer: "Diventa Organizzatore",
        contactUs: "Contattaci",
        support: "Supporto",
        helpCenter: "Centro Assistenza",
        faq: "Domande Frequenti",
        contactSupport: "Contatta il Supporto",
        privacyPolicy: "Politica sulla Privacy",
        termsOfService: "Termini di Servizio",
        stayUpdated: "Rimani Aggiornato",
        enterYourEmail: "Inserisci la tua email",
        availableWorldwide: "Disponibile in Tutto il Mondo",

        // Additional
        scheduleText: "Programma",
        featuredEvents: "Eventi in Evidenza",
        categories: "Categorie",

        clearSearch: "Cancella Ricerca",
        ticketsavailable: "Biglietti Disponibili",
        // Add to Italian translations (it):
        by: 'Di',
        eventsHosted: 'eventi ospitati',
        yourPremierDestination: 'La tua destinazione principale per scoprire e prenotare eventi straordinari.',
        connectWithExperiences: 'Connettiti con esperienze che contano per te.',
        home: 'Home',
        eventStreet: '123 Via degli Eventi',
        shahAlam: 'Shah Alam, Selangor 40150',
        malaysia: 'Malesia',
        monFriHours: 'Lun - Ven: 9:00 - 18:00',
        satSunHours: 'Sab - Dom: 10:00 - 16:00',
        allRightsReserved: 'Tutti i diritti riservati',
        eventBanner: 'Banner dell\'Evento',
        eventGallery: 'Galleria dell\'Evento',
        eventNotFound: 'Evento Non Trovato',
        backToEvents: 'Torna agli Eventi',
        featured: 'In Evidenza',
        aboutThisEvent: 'Informazioni su Questo Evento',
        onlineEventNote: 'Questo evento si svolgerà online. I dettagli di accesso verranno forniti dopo l\'acquisto.',
        eventOrganizer: 'Organizzatore dell\'Evento',
        venueInformation: 'Informazioni sul Luogo',
        visitWebsite: 'Visita il Sito Web',
        inYourCart: 'Nel Tuo Carrello',
        items: 'articoli',
        remove: 'Rimuovi',
        total: 'Totale',
        getTickets: 'Ottieni Biglietti',
        available: 'Disponibili',
        noTicketsAvailable: 'Nessun biglietto disponibile ancora',
        maxPerOrder: 'Max {max} per ordine',
        addToCart: 'Aggiungi al Carrello',
        soldOut: 'Esaurito',
        notAvailable: 'Non Disponibile',
        proceedToCheckout: 'Procedi al Checkout',

        manageTickets: 'Visualizza e gestisci tutti i tuoi biglietti per eventi',
        valid: 'Valido',
        cancelled: 'Annullato',
        upcoming: 'Prossimi',
        pastEvents: 'Eventi Passati',
        attended: 'Eventi Partecipati',
        download: 'Scarica',
        attendeeInformation: 'Informazioni Partecipante',
        purchaseDetails: 'Dettagli Acquisto',
        purchaseDate: 'Data di Acquisto',
        checkInDate: 'Data di Check-in',
        viewEventDetails: 'Visualizza Dettagli Evento',

        orderNotFound: 'Ordine non trovato',
        purchaseSuccessful: 'Acquisto completato con successo',
        ticketsConfirmedSentEmail: 'Biglietti confermati e inviati via email',
        eventDetails: 'Dettagli evento',
        orderDetails: 'Dettagli ordine',
        orderNumber: 'Numero ordine',
        totalAmount: 'Importo totale',
        orderDate: 'Data ordine',
        yourTickets: 'I tuoi biglietti',
        ticketsCount: 'Numero di biglietti',
        qrCode: 'Codice QR',
        importantNotice: 'Avviso importante',
        bringTicketsAndId: 'Porta i biglietti e un documento d\'identità',
        viewMyTickets: 'Visualizza i miei biglietti',
        browseMoreEvents: 'Esplora altri eventi',
        checkEmailForDetails: 'Controlla la tua email per i dettagli',
        downloadData: 'Scarica dati',
        defaultTimeZone: 'Fuso orario predefinito',

        serviceFee: 'Commissione',
        tax: 'Tassa',

        completePurchase: 'Completa l\'acquisto',
        minutes: 'minuti',
        hours: 'ore',
        hour: 'ora',

        monday: 'Lunedì',
        tuesday: 'Martedì',
        wednesday: 'Mercoledì',
        thursday: 'Giovedì',
        friday: 'Venerdì',
        saturday: 'Sabato',
        sunday: 'Domenica',

        jan: 'Gennaio',
        feb: 'Febbraio',
        mar: 'Marzo',
        apr: 'Aprile',
        may: 'Maggio',
        jun: 'Giugno',
        jul: 'Luglio',
        aug: 'Agosto',
        sep: 'Settembre',
        oct: 'Ottobre',
        nov: 'Novembre',
        dec: 'Dicembre',
    }
};

const extendedTranslations = {
    en: {
        ...translations.en,  // Your existing English translations
        ...settingsTranslationsEn
    },
    es: {
        ...translations.es,  // Your existing Spanish translations
        ...settingsTranslationsEs
    },
    fr: {
        ...translations.fr,  // Your existing French translations
        ...settingsTranslationsFr
    },
    de: {
        ...translations.de,  // Your existing German translations
        ...settingsTranslationsDe
    },
    it: {
        ...translations.it,  // Your existing Italian translations
        ...settingsTranslationsIt
    }
};


// I18n Context
interface I18nContextType {
    currentLanguage: string;
    currentLangData: typeof SUPPORTED_LANGUAGES[0];
    isRTL: boolean;
    t: (key: keyof TranslationKeys, params?: Record<string, any>) => string;
    formatCurrency: (amount: number, currency?: string) => string;
    formatDate: (date: Date, format?: string) => string;
    formatTime: (date: Date, format?: '12h' | '24h') => string;
    changeLanguage: (languageCode: string) => void;
    supportedLanguages: typeof SUPPORTED_LANGUAGES;
    availableLanguages: Array<{
        code: string;
        name: string;
        nativeName: string;
        flag: string;
    }>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [isRTL, setIsRTL] = useState(false);

    // Get current language data
    const currentLangData = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

    // Translation function with interpolation support
    const t = useCallback((key: keyof TranslationKeys, params?: Record<string, any>): string => {
        const translation = translations[currentLanguage]?.[key] || translations['en'][key] || key;
        return params ? interpolate(translation, params) : translation;
    }, [currentLanguage]);

    // Format currency
    const formatCurrency = useCallback((amount: number, currency?: string): string => {
        const currencyCode = currency || currentLangData.currency;
        try {
            return new Intl.NumberFormat(currentLangData.region, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount);
        } catch {
            return `${amount} ${currencyCode}`;
        }
    }, [currentLangData]);

    // Format date
    const formatDate = useCallback((date: Date, format?: string): string => {
        try {
            return new Intl.DateTimeFormat(currentLangData.region).format(date);
        } catch {
            return date.toLocaleDateString();
        }
    }, [currentLangData]);

    // Format time
    const formatTime = useCallback((date: Date, format?: '12h' | '24h'): string => {
        const timeFormat = format || currentLangData.timeFormat;
        try {
            return new Intl.DateTimeFormat(currentLangData.region, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: timeFormat === '12h'
            }).format(date);
        } catch {
            return date.toLocaleTimeString();
        }
    }, [currentLangData]);

    // Change language
    const changeLanguage = useCallback((languageCode: string) => {
        const langData = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        if (langData) {
            setCurrentLanguage(languageCode);
            setIsRTL(langData.direction === 'rtl');

            // Update document direction
            if (typeof document !== 'undefined') {
                document.documentElement.dir = langData.direction;
                document.documentElement.lang = languageCode;
            }

            // Save to localStorage
            try {
                localStorage.setItem('selectedLanguage', languageCode);
            } catch (error) {
                console.error('Error saving language preference:', error);
            }
        }
    }, []);

    useEffect(() => {
        const loadLanguageFromPreferences = async () => {
            try {
                // Check if user is logged in
                const authToken = localStorage.getItem('authToken');
                if (authToken) {
                    // Try to get user preferences
                    const response = await fetch('http://localhost:5251/api/user/preferences', {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    });

                    if (response.ok) {
                        const preferences = await response.json();
                        if (preferences.language && preferences.language !== currentLanguage) {
                            changeLanguage(preferences.language);
                            return; // Exit early if we found user preference
                        }
                    }
                }

                // Fallback: Load from localStorage or browser language
                const savedLanguage = localStorage.getItem('selectedLanguage');
                if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
                    changeLanguage(savedLanguage);
                } else {
                    // Detect browser language
                    const browserLang = navigator.language.split('-')[0];
                    const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
                    if (supportedLang) {
                        changeLanguage(browserLang);
                    }
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
                // Fallback to localStorage
                const savedLanguage = localStorage.getItem('selectedLanguage');
                if (savedLanguage) {
                    changeLanguage(savedLanguage);
                }
            }
        };

        loadLanguageFromPreferences();
    }, []); // Only run on mount

    // Add this: Method to sync language with user preferences
    const syncLanguageWithPreferences = useCallback(async (languageCode: string) => {
        try {
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
                await fetch('http://localhost:5251/api/user/preferences', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        language: languageCode
                    })
                });
            }
        } catch (error) {
            console.error('Error syncing language with server:', error);
        }
    }, []);

    // Load saved language on mount
    useEffect(() => {
        try {
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
                changeLanguage(savedLanguage);
            } else {
                // Detect browser language
                const browserLang = navigator.language.split('-')[0];
                const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
                if (supportedLang) {
                    changeLanguage(browserLang);
                }
            }
        } catch (error) {
            console.error('Error loading language preference:', error);
        }
    }, [changeLanguage]);

    const contextValue: I18nContextType = {
        currentLanguage,
        currentLangData,
        isRTL,
        t,
        formatCurrency,
        formatDate,
        formatTime,
        changeLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        availableLanguages: SUPPORTED_LANGUAGES.map(lang => ({
            code: lang.code,
            name: lang.name,
            nativeName: lang.nativeName,
            flag: lang.flag
        }))
    };

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
};

export {
    settingsTranslationsEn,
    settingsTranslationsEs,
    settingsTranslationsFr,
    settingsTranslationsDe,
    settingsTranslationsIt,
    extendedTranslations
};

export const useI18nContext = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18nContext must be used within an I18nProvider');
    }
    return context;
};

export const useI18n = useI18nContext;

export default translations;


