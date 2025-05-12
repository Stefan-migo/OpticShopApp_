export interface Dictionary {
  dashboard: {
    last30DaysPeriod?: string;
    greeting?: string;
    totalSales?: string;
    noSalesData?: string;
    totalCustomers?: string;
    noCustomerData?: string;
    inventoryStatus?: string;
    noInventoryData?: string;
    upcomingAppointments?: string;
    noUpcomingAppointments?: string;
    greetingFallback?: string; // Added greetingFallback key
  };
  customers: {
    form: {
      saveSuccess?: string;
      saveErrorTitle?: string;
      firstNameLabel?: string;
      firstNamePlaceholder?: string;
      lastNameLabel?: string;
      lastNamePlaceholder?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      phoneLabel?: string;
      phonePlaceholder?: string;
      notesLabel?: string;
      notesPlaceholder?: string;
      firstNameRequired?: string; // Added firstNameRequired key
      lastNameRequired?: string; // Added lastNameRequired key
      invalidEmail?: string; // Added invalidEmail key
      createdAtLabel?: string; // Added createdAtLabel key
    };
    tableActions?: { // Added tableActions object
      copyId?: string;
      viewDetails?: string;
      editCustomer?: string;
      deleteCustomer?: string;
    };
    fetchError?: string;
    deleteSuccess?: string;
    deleteErrorTitle?: string;
    title?: string;
    addCustomerButton?: string;
    addNewCustomerTitle?: string;
    addNewCustomerDescription?: string;
    loading?: string;
    filterPlaceholder?: string;
    editCustomerTitle?: string;
    editCustomerDescription?: string;
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
  };
  inventory: {
    fetchProductsError?: string;
    fetchStockError?: string;
    loadingProducts?: string;
    filterProductsPlaceholder?: string;
    addStockItemButton?: string;
    addNewStockItemTitle?: string;
    addNewStockItemDescription?: string;
    loadingStockItems?: string;
    filterStockPlaceholder?: string;
    editStockItemTitle?: string;
    editStockItemDescription?: string;
    deleteStockItemConfirmTitle?: string;
    deleteStockItemConfirmDescription?: string;
    stockDeleteSuccess?: string;
    stockDeleteErrorTitle?: string;
    productCatalogTab?: string;
    inventoryStockTab?: string;
    addProductButton?: string;
    addNewProductTitle?: string;
    addNewProductDescription?: string;
    editProductTitle?: string;
    editProductDescription?: string;
    deleteProductConfirmTitle?: string;
    deleteProductConfirmDescription?: string;
    productDeleteSuccess?: string;
    productDeleteErrorTitle?: string;
    deleteProductButton?: string; // Moved from stockColumns
    deleteStockItemButton?: string; // Moved from stockColumns
    productDetailsDialog: { // Added productDetailsDialog object
      title?: string;
      description?: string;
      nameLabel?: string;
      descriptionLabel?: string;
      categoryLabel?: string;
      supplierLabel?: string;
      brandLabel?: string;
      modelLabel?: string;
      basePriceLabel?: string;
      reorderLevelLabel?: string;
      createdAtLabel?: string;
      updatedAtLabel?: string;
      relatedStockItemsTitle?: string;
      relatedStockItemsDescription?: string;
    };
    stockColumns: {
      productNameHeader?: string;
      serialNumberHeader?: string;
      quantityHeader?: string;
      statusHeader?: string;
      locationHeader?: string;
      costPriceHeader?: string;
      purchaseDateHeader?: string;
      editStockItem?: string;
      deleteStockItem?: string;
    };
    stockItemForm: {
      loadErrorTitle?: string;
      loadErrorDescription?: string;
      saveSuccess?: string;
      saveErrorTitle?: string;
      productLabel?: string;
      selectProductPlaceholder?: string;
      serialNumberLabel?: string;
      serialNumberPlaceholder?: string;
      serialNumberDescription?: string;
      quantityLabel?: string;
      quantityPlaceholder?: string;
      costPriceLabel?: string;
      costPricePlaceholder?: string;
      purchaseDateLabel?: string;
      locationLabel?: string;
      locationPlaceholder?: string;
      statusLabel?: string;
      selectStatusPlaceholder?: string;
      statusAvailable?: string;
      statusSold?: string;
      damaged?: string;
      returned?: string;
      productRequired?: string; // Added productRequired key
      quantityMin?: string; // Added quantityMin key
      costNonNegative?: string; // Added costNonNegative key
    };
    productForm: {
      loadErrorTitle?: string;
      loadErrorDescription?: string;
      saveSuccess?: string;
      saveErrorTitle?: string;
      nameLabel?: string;
      namePlaceholder?: string;
      descriptionLabel?: string;
      descriptionPlaceholder?: string;
      categoryLabel?: string;
      selectCategoryPlaceholder?: string;
      supplierLabel?: string;
      selectSupplierPlaceholder?: string;
      brandLabel?: string;
      brandPlaceholder?: string;
      modelLabel?: string;
      modelPlaceholder?: string;
      reorderLevelLabel?: string;
      reorderLevelPlaceholder?: string;
      reorderLevelDescription?: string;
      basePriceLabel?: string;
      basePricePlaceholder?: string;
      nameRequired?: string; // Added nameRequired key
      invalidCategory?: string; // Added invalidCategory key
      invalidSupplier?: string; // Added invalidSupplier key
      priceNonNegative?: string; // Added priceNonNegative key
      reorderLevelNonNegativeInteger?: string; // Added reorderLevelNonNegativeInteger key
    };
  };
  prescriptions: { // Added prescriptions object
    detailsDialog: {
      title?: string;
      description?: string;
      customerLabel?: string;
      typeLabel?: string;
      prescriptionDateLabel?: string;
      expiryDateLabel?: string;
      prescriberLabel?: string;
      parametersTitle?: string;
      eyeHeader?: string;
      sphHeader?: string;
      cylHeader?: string;
      axisHeader?: string;
      addHeader?: string;
      prismHeader?: string;
      bcHeader?: string;
      diaHeader?: string;
      brandHeader?: string;
      odLabel?: string;
      osLabel?: string;
      notesTitle?: string;
    };
    form: { // <<< ADD THIS 'form' OBJECT >>>
      customerRequired?: string;
      invalidMedicalRecord?: string;
      invalidPrescriber?: string;
      prescriptionDateRequired?: string;
      loadErrorTitle?: string;
      loadErrorDescription?: string;
      recordLabel?: string;
      loadMedicalRecordsErrorTitle?: string;
      loadMedicalRecordsErrorDescription?: string;
      saveSuccess?: string;
      saveErrorTitle?: string;
      customerLabel?: string;
      selectCustomerPlaceholder?: string;
      medicalRecordLabel?: string;
      selectMedicalRecordPlaceholder?: string;
      prescriberLabel?: string;
      selectPrescriberPlaceholder?: string;
      typeLabel?: string;
      typeGlasses?: string;
      typeContactLens?: string;
      prescriptionDateLabel?: string;
      expiryDateLabel?: string;
      odTitle?: string;
      osTitle?: string;
      notesLabel?: string;
      notesPlaceholder?: string;
      paramLabels: { // Added paramLabels object
        sphLabel?: string;
        cylLabel?: string;
        axisLabel?: string;
        addLabel?: string;
        prismLabel?: string;
        bcLabel?: string;
        diaLabel?: string;
        brandLabel?: string;
      };
      paramPlaceholders: { // Added paramPlaceholders object
        sphPlaceholder?: string;
        cylPlaceholder?: string;
        axisPlaceholder?: string;
        addPlaceholder?: string;
        prismPlaceholder?: string;
        bcPlaceholder?: string;
        diaPlaceholder?: string;
        brandPlaceholder?: string;
      };
    },
    fetchError?: string; // Moved properties
    deleteSuccess?: string;
    deleteErrorTitle?: string;
    title?: string;
    addPrescriptionButton?: string;
    addNewPrescriptionTitle?: string;
    addNewPrescriptionDescription?: string;
    loading?: string;
    filterPlaceholder?: string;
    editPrescriptionTitle?: string;
    editPrescriptionDescription?: string;
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
    deleteButton?: string;
    columns: { // Added columns object
      customerNameHeader?: string;
      prescriptionDateHeader?: string;
      expiryDateHeader?: string;
      typeHeader?: string;
      prescriberHeader?: string;
      viewDetails?: string;
      editPrescription?: string;
      deletePrescription?: string;
    }
  },
  common: {
    loading?: string;
    failedToLoadData?: string;
    viewAll?: string;
    unexpectedError?: string;
    saving?: string;
    adding?: string;
    saveChanges?: string;
    addCustomer?: string;
    none?: string;
    openMenu?: string;
    actions?: string;
    cancel?: string;
    notAvailable?: string;
    addProduct?: string;
    addStockItem?: string;
    unnamedCustomer?: string;
    unnamedProfessional?: string;
    addPrescription?: string;
    invalidDate?: string;
    unknownCustomer?: string;
    close?: string;
    scheduling?: string;
    removeItem?: string; // Added removeItem key
    delete?: string;
    userNotFound?: string; // Added userNotFound key
    toggleNavigationMenu?: string; // Added toggleNavigationMenu key
    mobileSidebarTitle?: string; // Added for mobile sidebar accessibility
    mobileSidebarDescription?: string; // Added for mobile sidebar accessibility
    status: { // Added status object
      available?: string;
      sold?: string;
      damaged?: string;
      returned?: string;
      pending?: string; // Added pending key
      cancelled?: string; // Added cancelled key
      completed?: string; // Added completed key
    };
  };
  roles: {
    admin?: string;
    professional?: string;
    staff?: string;
  };
  medicalActions: {
    title?: string;
    selectCustomerTitle?: string;
    medicalHistoryTitle?: string;
    addRecordTitle?: string;
    cancelAddRecordButton?: string;
    addRecordButton?: string;
    cancelAddPrescriptionButton?: string;
    addPrescriptionButton?: string;
    addPrescriptionTitle?: string;
    customerSelect: {
      loadErrorTitle?: string;
      loadErrorDescription?: string;
      label?: string;
      searchPlaceholder?: string;
      placeholder?: string;
    };
    history: {
      selectCustomerMessage?: string;
      loading?: string;
      noHistoryMessage?: string;
      medicalRecordsTitle?: string;
      recordDateLabel?: string;
      professionalLabel?: string;
      chiefComplaintLabel?: string;
      diagnosisLabel?: string;
      treatmentPlanLabel?: string;
      notesLabel?: string;
      prescriptionsTitle?: string;
      prescriptionDateLabel?: string;
      typeLabel?: string;
      prescriberLabel?: string;
      odParamsTitle?: string;
      sphLabel?: string;
      cylLabel?: string;
      axisLabel?: string;
      addLabel?: string;
      prismLabel?: string;
      bcLabel?: string;
      diaLabel?: string;
      brandLabel?: string;
      osParamsTitle?: string;
    };
    recordForm: {
      recordDateRequired?: string;
      invalidProfessional?: string;
      loadErrorTitle?: string;
      loadErrorDescription?: string;
      saveSuccess?: string;
      saveErrorTitle?: string;
      recordDateLabel?: string;
      professionalLabel?: string;
      selectProfessionalPlaceholder?: string;
      chiefComplaintLabel?: string;
      chiefComplaintPlaceholder?: string;
      diagnosisLabel?: string;
      diagnosisPlaceholder?: string;
      examinationFindingsLabel?: string;
      examinationFindingsPlaceholder?: string;
      medicalHistoryLabel?: string;
      medicalHistoryPlaceholder?: string;
      treatmentPlanLabel?: string;
      treatmentPlanPlaceholder?: string;
      notesLabel?: string;
      notesPlaceholder?: string;
      addRecordButton?: string;
    };
  };
  appointments: {
    loadSettingsErrorTitle?: string;
    loadSettingsErrorDescription?: string;
    fetchError?: string;
    selectSlotToastTitle?: string;
    selectSlotToastDescription?: string;
    deleteSuccess?: string;
    deleteErrorTitle?: string;
    title?: string;
    scheduleButton?: string;
    scheduleNewTitle?: string;
    scheduleNewDescription?: string;
    loadingCalendar?: string;
    editTitle?: string;
    editDescription?: string;
    deleteButton?: string;
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
    form: {
      loadErrorTitle?: string;
      loadCustomersErrorDescription?: string;
      loadProfessionalsErrorDescription?: string;
      saveSuccess?: string;
      saveErrorTitle?: string;
      customerLabel?: string;
      selectCustomerPlaceholder?: string;
      dateTimeLabel?: string;
      durationLabel?: string;
      typeLabel?: string;
      selectTypePlaceholder?: string;
      typeEyeExam?: string;
      typeContactLensFitting?: string;
      typeFollowUp?: string;
      typeFrameSelection?: string;
      typeOther?: string;
      providerLabel?: string;
      selectProviderPlaceholder?: string;
      notesLabel?: string;
      notesPlaceholder?: string;
      scheduleButton?: string;
      customerRequired?: string; // Added customerRequired key
      invalidDateTime?: string; // Added invalidDateTime key
      durationMin?: string; // Added durationMin key
      invalidType?: string; // Added invalidType key
      invalidProvider?: string; // Added invalidProvider key
    };
  };
  sales: { // Added sales object
    taxWarningTitle?: string;
    taxWarningDescription?: string;
    taxInfoTitle?: string;
    taxInfoDescription?: string;
    emptySaleToast?: string;
    createOrderError?: string;
    inventoryUpdateFailed?: string;
    inventoryUpdateWarningTitle?: string;
    inventoryUpdateWarningDescription?: string;
    saleSuccessTitle?: string;
    orderNumberLabel?: string;
    saleErrorTitle?: string;
    unknownProduct?: string;
    serialNumberPrefix?: string;
    title?: string;
    viewHistoryButton?: string;
    newSaleTitle?: string;
    customerLabel?: string;
    selectCustomerPlaceholder?: string;
    searchCustomersPlaceholder?: string;
    noCustomerFound?: string;
    addItemLabel?: string;
    selectItemPlaceholder?: string;
    searchItemsPlaceholder?: string;
    noStockFound?: string;
    addButton?: string;
    currentSaleItemsTitle?: string;
    noItemsAdded?: string;
    quantityLabel?: string;
    orderSummaryTitle?: string;
    subtotalLabel?: string;
    taxLabel?: string;
    discountLabel?: string;
    discountPlaceholder?: string;
    totalLabel?: string;
    recordingSaleButton?: string;
    processPaymentButton?: string;
    history: { // Added history object
      fetchError?: string;
      loading?: string;
      filterPlaceholder?: string;
      title?: string;
      backToPosButton?: string;
      orderNumberHeader?: string; // Added missing keys
      dateHeader?: string; // Added missing keys
      customerHeader?: string; // Added missing keys
      statusHeader?: string; // Added missing keys
      totalAmountHeader?: string; // Added missing keys
      viewDetailsAction?: string; // Added missing keys
      detailsDialog: { // Added detailsDialog object
        title?: string;
        description?: string;
        customerLabel?: string;
        statusLabel?: string;
        orderDateLabel?: string;
        itemsTitle?: string;
        productHeader?: string;
        qtyHeader?: string;
        unitPriceHeader?: string;
        lineTotalHeader?: string;
        loadingItems?: string;
        noItemsFound?: string;
        subtotalLabel?: string;
        discountLabel?: string;
        taxLabel?: string;
        totalLabel?: string;
        paymentsTitle?: string;
        dateHeader?: string;
        methodHeader?: string;
        referenceHeader?: string;
        amountHeader?: string;
        loadingPayments?: string;
        noPaymentsRecorded?: string;
        orderNotesTitle?: string;
        loadErrorTitle?: string;
      };
    };
  };
  app: { // Added app object
    name?: string;
  };
  navigation: {
    dashboard?: string;
    customers?: string;
    inventory?: string;
    purchaseOrders?: string;
    prescriptions?: string;
    appointments?: string;
    sales?: string;
    reports?: string;
    medicalActions?: string;
    userManagement?: string;
    settings?: string;
  };
  settings: {
    title?: string;
    applicationSettingsTitle?: string;
    applicationSettingsDescription?: string;
    generalSectionTitle?: string;
    generalSectionDescription?: string;
    appointmentSettingsTitle?: string;
    appointmentSettingsDescription?: string;
    defaultSlotDurationLabel?: string;
    defaultSlotDurationPlaceholder?: string;
    workingHoursLabel?: string;
    hideWorkingHoursButton?: string;
    showWorkingHoursButton?: string;
    daysOfWeek?: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    saveAppointmentSettingsButton?: string;
    selectLanguagePlaceholder?: string;
  };
  languages: {
    en?: string;
    es?: string;
  };
  // Add other top-level keys as needed
  landing?: {
    appName?: string;
    navFeatures?: string;
    navAboutUs?: string;
    navPricing?: string;
    navFeedback?: string;
    navLogin?: string;
    navSignUp?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroCta?: string;
    featuresTitle?: string;
    feature1Title?: string;
    feature1Description?: string;
    feature2Title?: string;
    feature2Description?: string;
    feature3Title?: string;
    feature3Description?: string;
    feature4Title?: string;
    feature4Description?: string;
    feature5Title?: string;
    feature5Description?: string;
    feature6Title?: string;
    feature6Description?: string;
    aboutUsTitle?: string;
    aboutUsMissionTitle?: string;
    aboutUsMissionDescription?: string;
    aboutUsTeamTitle?: string;
    aboutUsTeamDescription?: string;
    aboutUsImageAlt?: string;
    pricingTitle?: string;
    pricingBasicTitle?: string;
    pricingBasicPrice?: string;
    pricingBasicDescription?: string;
    pricingBasicFeature1?: string;
    pricingBasicFeature2?: string;
    pricingBasicFeature3?: string;
    pricingBasicFeature4?: string;
    pricingProTitle?: string;
    pricingProPrice?: string;
    pricingProDescription?: string;
    pricingProFeature1?: string;
    pricingProFeature2?: string;
    pricingProFeature3?: string;
    pricingProFeature4?: string;
    pricingProFeature5?: string;
    pricingEnterpriseTitle?: string;
    pricingEnterprisePrice?: string;
    pricingEnterpriseDescription?: string;
    pricingEnterpriseFeature1?: string;
    pricingEnterpriseFeature2?: string;
    pricingEnterpriseFeature3?: string;
    pricingEnterpriseFeature4?: string;
    pricingEnterpriseFeature5?: string;
    pricingEnterpriseFeature6?: string;
    feedbackTitle?: string;
    testimonial1Name?: string;
    testimonial1Title?: string;
    testimonial1Quote?: string;
    testimonial2Name?: string;
    testimonial2Title?: string;
    testimonial2Quote?: string;
    ctaTitle?: string;
    ctaButton?: string;
    footerText?: string;
  };
}
