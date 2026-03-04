/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';

// Enhanced language definitions with more complete data
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
    eventTitle: string;
    eventDescription: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    ticketPrice: string;
    eventsSubtitle: string, 
    allEvents: string, 
    searchEvents: string,
    unpublished: string, 

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
    invalidInput: string;
    requiredField: string;

    // Dashboard specific
    welcomeBack: string;
    yourEvents: string;
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
    published: string;
    publish: string;
    online: string;
    noEventsYet: string;
    multiDaySchedule: string;
    maxCapacity: string;
    loadingDashboard: string;
    inPerson: string;
    draft: string;
    dashboardError: string;
    createYourFirstEvent: string;
    createFirstEventPrompt: string;
    publishedCount: string;
    dayEvent: string;
}

const interpolate = (str: string, params: Record<string, any> = {}): string => {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
    });
};

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
        eventTitle: 'Event Title',
        eventDescription: 'Event Description',
        eventDate: 'Event Date',
        eventTime: 'Event Time',
        eventLocation: 'Event Location',
        ticketPrice: 'Ticket Price',
        eventsSubtitle: 'Manage your events and track their performance', 
        allEvents: 'All Events',
        unpublished: 'Unpublished',
        searchEvents: 'Search events...',

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
        invalidInput: 'Invalid input',
        requiredField: 'This field is required',

        // Dashboard specific
        welcomeBack: 'Welcome back, {name}!',
        yourEvents: 'Your Events',
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
        published: 'Published',
        publish: 'Publish',
        online: 'Online',
        noEventsYet: 'No events yet',
        multiDaySchedule: 'Multi-day schedule',
        maxCapacity: 'Max Capacity',
        loadingDashboard: 'Loading your dashboard...',
        inPerson: 'In-Person',
        draft: 'Draft',
        dashboardError: 'Failed to load dashboard data',
        createYourFirstEvent: 'Create Your First Event',
        createFirstEventPrompt: 'Create your first event to get started with EventPro.',
        publishedCount: '{count} published',
        dayEvent: '{count}-day event'
    },
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
        eventTitle: 'Título del Evento',
        eventDescription: 'Descripción del Evento',
        eventDate: 'Fecha del Evento',
        eventTime: 'Hora del Evento',
        eventLocation: 'Ubicación del Evento',
        ticketPrice: 'Precio del Boleto',
        eventsSubtitle: 'Gestiona tus eventos y rastrea su rendimiento', // NEW
        allEvents: 'Todos los Eventos',
        unpublished: 'No Publicado',
        searchEvents: 'Buscar eventos...',

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
        invalidInput: 'Entrada inválida',
        requiredField: 'Este campo es obligatorio',

        // Dashboard specific
        welcomeBack: '¡Bienvenido de vuelta, {name}!',
        yourEvents: 'Tus Eventos',
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
        published: 'Publicado',
        publish: 'Publicar',
        online: 'En línea',
        noEventsYet: 'Aún no hay eventos',
        multiDaySchedule: 'Horario de varios días',
        maxCapacity: 'Capacidad Máxima',
        loadingDashboard: 'Cargando tu panel...',
        inPerson: 'Presencial',
        draft: 'Borrador',
        dashboardError: 'Error al cargar los datos del panel',
        createYourFirstEvent: 'Crear Tu Primer Evento',
        createFirstEventPrompt: 'Crea tu primer evento para comenzar con EventPro.',
        publishedCount: '{count} publicados',
        dayEvent: 'Evento de {count} días'
    },
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

        // Navigation
        dashboard: 'Tableau de Bord',
        events: 'Événements',
        settings: 'Paramètres',
        profile: 'Profil',
        logout: 'Déconnexion',

        // Settings
        personalInformation: 'Informations Personnelles',
        organization: 'Organisation',
        notifications: 'Notifications',
        security: 'Sécurité',
        appearance: 'Apparence',
        language: 'Langue',
        preferences: 'Préférences',

        // Profile
        firstName: 'Prénom',
        lastName: 'Nom',
        email: 'Email',
        phoneNumber: 'Numéro de Téléphone',
        companyName: 'Nom de l\'Entreprise',
        address: 'Adresse',
        city: 'Ville',
        state: 'État',
        zipCode: 'Code Postal',
        country: 'Pays',

        // Events
        createEvent: 'Créer un Événement',
        eventTitle: 'Titre de l\'Événement',
        eventDescription: 'Description de l\'Événement',
        eventDate: 'Date de l\'Événement',
        eventTime: 'Heure de l\'Événement',
        eventLocation: 'Lieu de l\'Événement',
        ticketPrice: 'Prix du Billet',
        eventsSubtitle: 'Gérez vos événements et suivez leurs performances',
        allEvents: 'Tous les Événements',
        unpublished: 'Non Publié',
        searchEvents: 'Rechercher des événements...',

        // Appearance
        theme: 'Thème',
        lightMode: 'Mode Clair',
        darkMode: 'Mode Sombre',
        autoMode: 'Mode Automatique',
        accentColor: 'Couleur d\'Accent',
        fontSize: 'Taille de Police',
        compactMode: 'Mode Compact',

        // Time and Date
        timeFormat: 'Format d\'Heure',
        dateFormat: 'Format de Date',
        currency: 'Devise',
        timezone: 'Fuseau Horaire',

        // Messages
        saveSuccess: 'Paramètres enregistrés avec succès !',
        saveError: 'Échec de l\'enregistrement des paramètres',
        loadError: 'Échec du chargement des données',
        invalidInput: 'Entrée invalide',
        requiredField: 'Ce champ est obligatoire',

        // Dashboard specific
        welcomeBack: 'Bon retour, {name} !',
        yourEvents: 'Vos Événements',
        virtualEvent: 'Événement Virtuel',
        viewAllEvents: 'Voir tous les événements →',
        upcomingEvents: 'Événements à Venir',
        unpublish: 'Dépublier',
        unlimited: 'Illimité',
        uncategorized: 'Non catégorisé',
        totalRevenue: 'Revenus Totaux',
        totalEvents: 'Total des Événements',
        ticketsSold: 'Billets Vendus',
        revenue: 'Revenus',
        published: 'Publié',
        publish: 'Publier',
        online: 'En ligne',
        noEventsYet: 'Aucun événement pour le moment',
        multiDaySchedule: 'Horaire sur plusieurs jours',
        maxCapacity: 'Capacité Maximale',
        loadingDashboard: 'Chargement de votre tableau de bord...',
        inPerson: 'En Personne',
        draft: 'Brouillon',
        dashboardError: 'Échec du chargement des données du tableau de bord',
        createYourFirstEvent: 'Créer Votre Premier Événement',
        createFirstEventPrompt: 'Créez votre premier événement pour commencer avec EventPro.',
        publishedCount: '{count} publiés',
        dayEvent: 'Événement de {count} jours'
    },
    de: {
        // Common
        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        view: 'Ansehen',
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        confirm: 'Bestätigen',

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
        createEvent: 'Veranstaltung Erstellen',
        eventTitle: 'Veranstaltungstitel',
        eventDescription: 'Veranstaltungsbeschreibung',
        eventDate: 'Veranstaltungsdatum',
        eventTime: 'Veranstaltungszeit',
        eventLocation: 'Veranstaltungsort',
        ticketPrice: 'Ticketpreis',
        eventsSubtitle: 'Verwalten Sie Ihre Veranstaltungen und verfolgen Sie deren Leistung',
        allEvents: 'Alle Veranstaltungen',
        unpublished: 'Unveröffentlicht',
        searchEvents: 'Veranstaltungen suchen...',

        // Appearance
        theme: 'Theme',
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
        invalidInput: 'Ungültige Eingabe',
        requiredField: 'Dieses Feld ist erforderlich',

        // Dashboard specific
        welcomeBack: 'Willkommen zurück, {name}!',
        yourEvents: 'Ihre Veranstaltungen',
        virtualEvent: 'Virtuelle Veranstaltung',
        viewAllEvents: 'Alle Veranstaltungen anzeigen →',
        upcomingEvents: 'Bevorstehende Veranstaltungen',
        unpublish: 'Veröffentlichung aufheben',
        unlimited: 'Unbegrenzt',
        uncategorized: 'Unkategorisiert',
        totalRevenue: 'Gesamtumsatz',
        totalEvents: 'Gesamte Veranstaltungen',
        ticketsSold: 'Verkaufte Tickets',
        revenue: 'Umsatz',
        published: 'Veröffentlicht',
        publish: 'Veröffentlichen',
        online: 'Online',
        noEventsYet: 'Noch keine Veranstaltungen',
        multiDaySchedule: 'Mehrtägiger Zeitplan',
        maxCapacity: 'Maximale Kapazität',
        loadingDashboard: 'Ihr Dashboard wird geladen...',
        inPerson: 'Vor Ort',
        draft: 'Entwurf',
        dashboardError: 'Fehler beim Laden der Dashboard-Daten',
        createYourFirstEvent: 'Ihre Erste Veranstaltung Erstellen',
        createFirstEventPrompt: 'Erstellen Sie Ihre erste Veranstaltung, um mit EventPro zu beginnen.',
        publishedCount: '{count} veröffentlicht',
        dayEvent: '{count}-tägige Veranstaltung'
    },
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

        // Navigation
        dashboard: 'Dashboard',
        events: 'Eventi',
        settings: 'Impostazioni',
        profile: 'Profilo',
        logout: 'Disconnetti',

        // Settings
        personalInformation: 'Informazioni Personali',
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
        phoneNumber: 'Numero di Telefono',
        companyName: 'Nome Azienda',
        address: 'Indirizzo',
        city: 'Città',
        state: 'Regione',
        zipCode: 'CAP',
        country: 'Paese',

        // Events
        createEvent: 'Crea Evento',
        eventTitle: 'Titolo Evento',
        eventDescription: 'Descrizione Evento',
        eventDate: 'Data Evento',
        eventTime: 'Ora Evento',
        eventLocation: 'Luogo Evento',
        ticketPrice: 'Prezzo Biglietto',
        eventsSubtitle: 'Gestisci i tuoi eventi e monitora le loro prestazioni',
        allEvents: 'Tutti gli Eventi',
        unpublished: 'Non Pubblicato',
        searchEvents: 'Cerca eventi...',

        // Appearance
        theme: 'Tema',
        lightMode: 'Modalità Chiara',
        darkMode: 'Modalità Scura',
        autoMode: 'Modalità Automatica',
        accentColor: 'Colore Accent',
        fontSize: 'Dimensione Font',
        compactMode: 'Modalità Compatta',

        // Time and Date
        timeFormat: 'Formato Ora',
        dateFormat: 'Formato Data',
        currency: 'Valuta',
        timezone: 'Fuso Orario',

        // Messages
        saveSuccess: 'Impostazioni salvate con successo!',
        saveError: 'Errore nel salvare le impostazioni',
        loadError: 'Errore nel caricare i dati',
        invalidInput: 'Input non valido',
        requiredField: 'Questo campo è obbligatorio',

        // Dashboard specific
        welcomeBack: 'Bentornato, {name}!',
        yourEvents: 'I Tuoi Eventi',
        virtualEvent: 'Evento Virtuale',
        viewAllEvents: 'Visualizza tutti gli eventi →',
        upcomingEvents: 'Eventi Prossimi',
        unpublish: 'Rimuovi Pubblicazione',
        unlimited: 'Illimitato',
        uncategorized: 'Senza Categoria',
        totalRevenue: 'Ricavi Totali',
        totalEvents: 'Eventi Totali',
        ticketsSold: 'Biglietti Venduti',
        revenue: 'Ricavi',
        published: 'Pubblicato',
        publish: 'Pubblica',
        online: 'Online',
        noEventsYet: 'Nessun evento ancora',
        multiDaySchedule: 'Programma multi-giorno',
        maxCapacity: 'Capacità Massima',
        loadingDashboard: 'Caricamento dashboard...',
        inPerson: 'Di Persona',
        draft: 'Bozza',
        dashboardError: 'Errore nel caricare i dati del dashboard',
        createYourFirstEvent: 'Crea il Tuo Primo Evento',
        createFirstEventPrompt: 'Crea il tuo primo evento per iniziare con EventPro.',
        publishedCount: '{count} pubblicati',
        dayEvent: 'Evento di {count} giorni'
    }
};

export const useI18n = () => {
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
            }
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

    return {
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
};