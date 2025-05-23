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
    greetingFallback?: string;
    greetingWithTenant?: string;
    newSaleButton?: string;
    scheduleAppointmentButton?: string;
    salesThisWeek?: string;
    salesLastWeek?: string;
    appointmentsThisWeek?: string;
    lowStockItemsCount?: string;
    salesChangePercentage?: string;
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
      firstNameRequired?: string;
      lastNameRequired?: string;
      invalidEmail?: string;
      createdAtLabel?: string;
      userFetchError?: string;
      tenantFetchError?: string;
      dobLabel?: string;
      dobPlaceholder?: string;
      addressLine1Label?: string;
      addressLine1Placeholder?: string;
      addressLine2Label?: string;
      addressLine2Placeholder?: string;
      cityLabel?: string;
      cityPlaceholder?: string;
      stateLabel?: string;
      statePlaceholder?: string;
      postalCodeLabel?: string;
      postalCodePlaceholder?: string;
      countryLabel?: string;
      countryPlaceholder?: string;
      insuranceProviderLabel?: string;
      insuranceProviderPlaceholder?: string;
      insurancePolicyNumberLabel?: string;
      insurancePolicyNumberPlaceholder?: string;
      phone?: string;
    };
    tableActions?: {
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
    customerDetails?: {
      title?: string;
      returnButton?: string;
      customerInfoTitle?: string;
      pastSalesTitle?: string;
      appointmentsTitle?: string;
      prescriptionsTitle?: string;
      notesTitle?: string;
      loading?: string;
      error?: string;
      noData?: string;
      emailLabel?: string;
      phoneLabel?: string;
      dobLabel?: string;
      addressLabel?: string;
      insuranceTitle?: string;
      insuranceProviderLabel?: string;
      insurancePolicyNumberLabel?: string;
      insurancePolicyNumberPlaceholder?: string;
      notesLabel?: string;
      emptyNote?: string;
      addNoteSuccess?: string;
      addNoteError?: string;
      addNoteTitle?: string;
      notesPlaceholder?: string;
      addingNote?: string;
      addNoteButton?: string;
      existingNotesTitle?: string;
    };
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
    deleteProductButton?: string;
    deleteStockItemButton?: string;
    productDetailsDialog: {
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
    productColumns: {
      nameHeader?: string;
      categoryHeader?: string;
      brandHeader?: string;
      priceHeader?: string;
      createdAtHeader?: string;
      editProduct?: string;
      viewDetails?: string;
      deleteProduct?: string;
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
      nameRequired?: string;
      invalidCategory?: string;
      invalidSupplier?: string;
      priceNonNegative?: string;
      reorderLevelNonNegativeInteger?: string;
      searchCategoryPlaceholder?: string; // Added for Combobox
      noCategoryFound?: string; // Added for Combobox
      searchSupplierPlaceholder?: string; // Added for Combobox
      noSupplierFound?: string; // Added for Combobox
    };
    suppliersTabTitle?: string; // Added for Suppliers tab title
    supplierForm?: { // Added for Supplier form
      nameLabel?: string;
      namePlaceholder?: string;
      contactPersonLabel?: string;
      contactPersonPlaceholder?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      phoneLabel?: string;
      phonePlaceholder?: string;
      addressLabel?: string;
      addressPlaceholder?: string;
      addButton?: string;
      editButton?: string; // Added for Supplier form edit button
      saveChangesButton?: string; // Added for Supplier form save changes button
      saveErrorTitle?: string; // Added for Supplier form save error title
      saveSuccess?: string; // Added for Supplier form save success
    };
    supplierTable?: { // Added for Supplier table
      nameHeader?: string;
      contactPersonHeader?: string;
      emailHeader?: string;
      phoneHeader?: string;
      addressHeader?: string;
      deleteErrorTitle?: string; // Added for Supplier table delete error title
      deleteSuccess?: string; // Added for Supplier table delete success
      deleteConfirmTitle?: string; // Added for delete confirmation title
      deleteConfirmDescription?: string; // Added for delete confirmation description
      filterPlaceholder?: string;
    };
    categoriesTabTitle?: string; // Added for Categories tab title
    categoryForm?: { // Added for Category form
      nameLabel?: string;
      namePlaceholder?: string;
      addButton?: string;
      saveErrorTitle?: string; // Added for category form save error title
      saveSuccess?: string; // Added for category form save success
      saveChangesButton?: string; // Added for category form save changes button
      editButton?: string; // Added for category form edit button
      deleteSuccess?: string; // Added for category delete success
      deleteErrorTitle?: string; // Added for category delete error title
      deleteConfirmTitle?: string; // Added for category delete confirmation title
      deleteConfirmDescription?: string; // Added for category delete confirmation description
      nameRequired?: string; // Added for category name required message
      editTitle?: string; // Added for Edit Category Dialog title
      editDescription?: string; // Added for Edit Category Dialog description
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
      productRequired?: string;
      quantityMin?: string;
      costNonNegative?: string;
      searchProductPlaceholder?: string; // Added for Combobox
      noProductFound?: string; // Added for Combobox
    };
  };
  prescriptions: {
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
    form: {
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
      typeFollowUp?: string;
      typeFrameSelection?: string;
      typeOther?: string;
      prescriptionDateLabel?: string;
      expiryDateLabel?: string;
      odTitle?: string;
      osTitle?: string;
      notesLabel?: string;
      notesPlaceholder?: string;
      paramLabels: {
        sphLabel?: string;
        cylLabel?: string;
        axisLabel?: string;
        addLabel?: string;
        prismLabel?: string;
        bcLabel?: string;
        diaLabel?: string;
        brandLabel?: string;
      };
      paramPlaceholders: {
        sphPlaceholder?: string;
        cylPlaceholder?: string;
        axisPlaceholder?: string;
        addPlaceholder?: string;
        prismPlaceholder?: string;
        bcPlaceholder?: string;
        diaPlaceholder?: string;
        brandPlaceholder?: string;
      };
    };
    columns: {
      customerNameHeader?: string;
      prescriptionDateHeader?: string;
      expiryDateHeader?: string;
      typeHeader?: string;
      prescriberHeader?: string;
      viewDetails?: string;
      editPrescription?: string;
      deletePrescription?: string;
    };
    deleteSuccess?: string;
    deleteErrorTitle?: string;
    title?: string;
    addPrescriptionButton?: string;
    addNewPrescriptionTitle?: string;
    addNewPrescriptionDescription?: string;
    filterPlaceholder?: string;
    editPrescriptionTitle?: string;
    editPrescriptionDescription?: string;
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
    deleteButton?: string;
  };
  common: {
    columns?: string;
    of?: string;
    rowsSelected?: string;
    previous?: string;
    next?: string;
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
    removeItem?: string;
    delete?: string;
    userNotFound?: string;
    toggleNavigationMenu?: string;
    mobileSidebarTitle?: string;
    mobileSidebarDescription?: string;
    statusHeader?: string; // Added generic status header key
    status: {
      available?: string;
      sold?: string;
      damaged?: string;
      returned?: string;
      completed?: string;
      in_stock?: string;
      out_of_stock?: string;
      pending?: string;
      cancelled?: string;
    };
    copyId?: string; // Added for common copy ID action
    edit?: string; // Added for common edit action
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
      customerRequired?: string;
      invalidDateTime?: string;
      durationMin?: string;
      invalidType?: string;
      invalidProvider?: string;
    };
  };
  sales: {
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
    history: {
      fetchError?: string;
      loading?: string;
      filterPlaceholder?: string;
      title?: string;
      backToPosButton?: string;
      orderNumberHeader?: string;
      dateHeader?: string;
      customerHeader?: string;
      statusHeader?: string;
      totalAmountHeader?: string;
      viewDetailsAction?: string;
      detailsDialog: {
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
  userManagement: {
    title?: string;
    accessDeniedTitle?: string;
    accessDeniedDescription?: string;
    loadingUsers?: string;
    failedToLoadData?: string;
    roleUpdateSuccess?: string;
    roleUpdateErrorTitle?: string;
    unexpectedError?: string;
    filterEmailPlaceholder?: string;
    columns: {
      nameHeader?: string;
      emailHeader?: string;
      roleHeader?: string;
      noRole?: string;
      openMenu?: string;
      actions?: string;
      changeRole?: string;
    };
  };
  app: {
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
    profile?: string;
    history?: string;
    new?: string;
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
    pricingBasicFeature5?: string;
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
  loginPage: {
    title?: string;
    description?: string;
    emailLabel?: string;
    emailPlaceholder?: string;
    passwordLabel?: string;
    signInButton?: string;
    signingInButton?: string;
    noAccountText?: string;
    signUpLink?: string;
    toast: { // Add toast property
      loginErrorTitle?: string;
      loginSuccessTitle?: string;
      loginSuccessDescription?: string;
    };
    forgotPasswordLink?: string; // Added forgotPasswordLink
    orContinueWith?: string; // Added orContinueWith
    loginWithGoogle?: string; // Added loginWithGoogle
    imageAltText?: string; // Added imageAltText
    termsAndPrivacyText?: string; // Added termsAndPrivacyText
    termsLinkText?: string; // Added termsLinkText
    andText?: string; // Added andText
    privacyLinkText?: string; // Added privacyLinkText
  };
  purchaseOrders: {
    title?: string;
    newTitle?: string;
    addNewPurchaseOrderButton?: string;
    filterPlaceholder?: string;
    tableColumns?: {
      supplierHeader?: string;
      orderDateHeader?: string;
      expectedDeliveryDateHeader?: string;
      statusHeader?: string;
      totalAmountHeader?: string;
      createdAtHeader?: string;
      actionsHeader?: string;
    };
    tableActions?: {
      viewDetails?: string;
      editPurchaseOrder?: string;
      deletePurchaseOrder?: string;
    };
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
    deleteSuccess?: string;
    deleteErrorTitle?: string;
    addNewPageTitle?: string;
    returnButton?: string;
    detailsCardTitle?: string;
    form?: {
      searchSupplierPlaceholder?: string;
      noSupplierFound?: string;
      searchProductPlaceholder?: string;
      noProductFound?: string;
      supplierLabel?: string;
      selectSupplierPlaceholder?: string;
      noneOption?: string;
      statusLabel?: string;
      selectStatusPlaceholder?: string;
      statusOptions?: {
        draft?: string;
        ordered?: string;
        received?: string;
        cancelled?: string;
      };
      orderDateLabel?: string;
      pickDatePlaceholder?: string;
      expectedDeliveryDateLabel?: string;
      pickDateOptionalPlaceholder?: string;
      itemsTitle?: string;
      productLabel?: string;
      selectProductPlaceholder?: string;
      quantityLabel?: string;
      unitPriceLabel?: string;
      addItemButton?: string;
      saveChangesButton?: string;
      createPurchaseOrderButton?: string;
      validation?: {
        atLeastOneItemRequired?: string;
        supplierRequired?: string;
        orderDateRequired?: string;
        productRequired?: string;
        quantityMin?: string;
        unitPriceNonNegative?: string;
      };
    };
  };
}
