# Jazzmin Admin Configuration
JAZZMIN_SETTINGS = {
    # Title on the login screen and main page
    "site_title": "Music Studio Manager",
    "site_header": "Music Studio Manager",
    "site_brand": "Music Studio Manager",
    "site_logo": None,  # Can add logo later
    "login_logo": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    
    # Welcome text on the login screen
    "welcome_sign": "Welcome to Music Studio Manager",
    "copyright": "Built with StudioSync",
    
    # Search on the top nav bar
    "search_model": ["core.User", "core.Student", "core.Band"],
    
    # Field name on user model that contains avatar
    "user_avatar": "avatar",
    
    # Top menu
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "/", "new_window": True},
        {"model": "core.User"},
        {"model": "core.Student"},
    ],
    
    # Whether to show the UI customizer on the sidebar
    "show_ui_builder": False,
    
    # Whether to allow the user to change the UI settings
    "changeform_format": "horizontal_tabs",
    
    # Whether to show the sidebar
    "show_sidebar": True,
    
    # Whether to aut expand the menu
    "navigation_expanded": True,
    
    # Hide these apps when generating side menu
    "hide_apps": [],
    
    # Hide these models when generating side menu
    "hide_models": [],
    
    # Order of apps & models in the side menu
    "order_with_respect_to": ["core", "lessons", "billing", "resources", "messaging"],
    
    # Custom icons for apps and models
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        
        "core.User": "fas fa-user-circle",
        "core.Studio": "fas fa-building",
        "core.Teacher": "fas fa-chalkboard-teacher",
        "core.Student": "fas fa-user-graduate",
        "core.Band": "fas fa-users",
        
        "lessons.Lesson": "fas fa-calendar-check",
        "lessons.LessonNote": "fas fa-sticky-note",
        "lessons.RecurringPattern": "fas fa-sync",
        "lessons.StudentGoal": "fas fa-bullseye",
        
        "billing.Invoice": "fas fa-file-invoice-dollar",
        "billing.InvoiceLineItem": "fas fa-list",
        "billing.Payment": "fas fa-dollar-sign",
        "billing.PaymentMethod": "fas fa-credit-card",
        
        "resources.Resource": "fas fa-book",
        "resources.ResourceCheckout": "fas fa-exchange-alt",
        
        "messaging.MessageThread": "fas fa-comments",
        "messaging.Message": "fas fa-comment",
        "messaging.Notification": "fas fa-bell",
    },
    
    # Icons that are used when one is not manually specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    # Use modals instead of popups
    "related_modal_active": False,
    
    # Custom CSS/JS
    "custom_css": "admin/css/custom_admin.css",
    "custom_js": None,
    
    # Show language chooser
    "show_language_chooser": False,
    
    # Change form templates
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "collapsible",
    },
}

# Jazzmin UI Tweaks
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": True,
    "theme": "lumen",  # Options: default, cerulean, cosmo, cyborg, darkly, flatly, journal, litera, lumen, lux, materia, minty, pulse, sandstone, simplex, slate, solar, spacelab, superhero, united, yeti
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
