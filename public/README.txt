Consent Manager Installation Instructions

1. Extract the contents of this zip file
2. Place the files in your website directory
3. Add the following code to your HTML page, inside the <head> tag:

<link rel="stylesheet" id="silktide-consent-manager-css" href="path-to-css/silktide-consent-manager.css">
<script src="path-to-js/silktide-consent-manager.js"></script>
<script>
silktideCookieBannerManager.updateCookieBannerConfig({
  background: {
    showBackground: true
  },
  cookieIcon: {
    position: "bottomLeft"
  },
  cookieTypes: [
    {
      id: "necessary",
      name: "Necessary",
      description: "<p>These cookies are necessary for the website to function properly and cannot be switched off. They help with things like logging in and setting your privacy preferences.</p>",
      required: true,
      onAccept: function() {
        console.log('Add logic for the required Necessary here');
      }
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "<p>These cookies help us improve the site by tracking which pages are most popular and how visitors move around the site.</p>",
      defaultValue: true,
      onAccept: function() {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
        dataLayer.push({
          'event': 'consent_accepted_analytics',
        });
      },
      onReject: function() {
        gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    },
    {
      id: "advertising",
      name: "Advertising",
      description: "<p>These cookies provide extra features and personalization to improve your experience. They may be set by us or by partners whose services we use.</p>",
      onAccept: function() {
        gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
        dataLayer.push({
          'event': 'consent_accepted_advertising',
        });
      },
      onReject: function() {
        gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }
  ],
  text: {
    banner: {
      description: "<p><span style=\"color: rgb(255, 255, 255); font-family: CombinedFonts, BananaGrotesk, sans-serif; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(0, 0, 0); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;\">We use cookies to enhance your browsing experie nce, personalize content, and analyze our traffic. By clicking \"Accept All Cookies\", you agree to the storing of cookies on your device. For more information, please see our<span>&nbsp;</span></span><a class=\"mantine-focus-auto theme_anchor__2MnkG m_849cf0da m_b6d8b162 mantine-Text-root mantine-Anchor-root\" data-size=\"md\" data-underline=\"hover\" href=\"https://giveprotocol.io/privacy\" rel=\"noopener noreferrer\" target=\"_blank\" data-sentry-element=\"Anchor\" data-sentry-source-file=\"OffsiteLink.tsx\" data-sentry-component=\"OffsiteLink\" style=\"box-sizing: border-box; -webkit-tap-highlight-color: transparent; text-decoration: none; font-size: 16px; line-height: 1.55; font-weight: 400; margin: 0px; padding: 0px; color: rgb(255, 255, 255); appearance: none; border: none; display: inline; background-color: rgb(0, 0, 0); cursor: pointer; font-family: CombinedFonts, BananaGrotesk, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; --text-fz: calc(1rem * 1); --text-lh: 1.55;\">Privacy Policy</a><a href=\"https://your-website.com/cookie-policy\" target=\"_blank\">PrivaPolicy.</a></p>",
      acceptAllButtonText: "Accept all",
      acceptAllButtonAccessibleLabel: "Accept all cookies",
      rejectNonEssentialButtonText: "Reject non-essential",
      rejectNonEssentialButtonAccessibleLabel: "Reject non-essential",
      preferencesButtonText: "Preferences",
      preferencesButtonAccessibleLabel: "Toggle preferences"
    },
    preferences: {
      title: "Customize your cookie preferences",
      description: "<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>",
      creditLinkText: "",
      creditLinkAccessibleLabel: ""
    }
  },
  position: {
    banner: "bottomCenter"
  }
});
</script>
