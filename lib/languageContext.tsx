'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    'enterEmail': 'Enter your email to start shopping',
    'email': 'Email',
    'emailPlaceholder': 'Enter your email',
    'startShopping': 'Start Shopping →',
    'emailRequired': 'Please enter your email address',
    'emailNotAuthorized': 'This email is not authorized to access the site. Please contact support.',
    'selectProduct': 'Select Your Products',
    'chooseProduct': 'Choose your products and options',
    'budgetInfo': 'Budget Limit: You can order up to $200 total. Mix and match any products to stay within your budget.',
    'selectProductLabel': 'Select Product',
    'chooseProductPlaceholder': '-- Choose a product --',
    'color': 'Color',
    'size': 'Size',
    'selectColor': '-- Select color --',
    'selectSize': '-- Select size --',
    'quantity': 'Qty',
    'maxToStayWithinBudget': 'Max {max} to stay within budget',
    'exceedsBudget': '(Exceeds budget)',
    'budgetLimitReached': 'Budget limit reached. Remove items to add more.',
    'pleaseAddProduct': 'Please add at least one product to your cart',
    'logoColor': 'Logo Color',
    'selectLogoColor': '-- Select logo color --',
    'pleaseSelectLogoColor': 'Please select a logo color',
    'pleaseSelectProduct': 'Please select a product',
    'pleaseSelectColor': 'Please select a color',
    'pleaseSelectSize': 'Please select a size',
    'back': '← Back',
    'abandonCart': 'Abandon Cart',
    'abandonCartTitle': 'Abandon Cart?',
    'abandonCartMessage': 'You have items in your cart. Returning to the landing page will clear your cart and you\'ll need to start over. Are you sure you want to continue?',
    'cancel': 'Cancel',
    'continueShipping': 'Continue to Shipping →',
    'budgetReminderTitle': 'Room to Add More',
    'budgetReminderMessage': 'You still have',
    'budgetReminderMessageEnd': 'remaining in your budget. Would you like to add more products to maximize your selection?',
    'addMoreProducts': 'Add More Products',
    'continueAnyway': 'Continue Anyway',
    'currentTotal': 'Current Total',
    'remainingBudget': 'Remaining',
    'budgetExceeded': 'Budget exceeded! Please remove items or select cheaper options.',
    'addToCart': 'Add to Cart',
    'remove': 'Remove',
    'cart': 'Cart',
    'emptyCart': 'Your cart is empty',
    'loadingProducts': 'Loading products...',
    'shippingInfo': 'Shipping Information',
    'provideShipping': 'Please provide your shipping details',
    'shippingInstructions': 'All orders will be shipped to the below address.',
    'emailAddress': 'Email Address',
    'emailSetFromLogin': 'Email is set from your login',
    'fullName': 'Full Name',
    'streetAddress': 'Street Address',
    'addressLine2': 'Address Line 2',
    'city': 'City',
    'state': 'State',
    'zipCode': 'ZIP Code',
    'country': 'Country',
    'validEmail': 'Please enter a valid email address',
    'fillRequiredFields': 'Please fill in all required fields',
    'continueReview': 'Continue to Review →',
    'reviewOrder': 'Review Your Order',
    'reviewInfo': 'Please review your product selection and shipping information before submitting, and feel free to screenshot this information for your convenience.',
    'selectedProducts': 'Selected Products',
    'total': 'Total',
    'submitOrder': 'Submit Order →',
    'submitting': 'Submitting...',
    'orderConfirmed': 'Order Confirmed!',
    'thankYouOrder': 'Thank you for your order',
    'yourOrderNumber': 'Your Order Number:',
    'screenshotInfo': 'Screenshot this page or email yourself your order number by clicking the button below',
    'emailConfirmation': 'Email Order Confirmation',
    'sizingChart': 'Sizing Chart',
    'sizingChartTitle': 'Sizing Chart',
  },
  fr: {
    'enterEmail': 'Entrez votre e-mail pour commencer vos achats',
    'email': 'E-mail',
    'emailPlaceholder': 'Entrez votre e-mail',
    'startShopping': 'Commencer les achats →',
    'emailRequired': 'Veuillez entrer votre adresse e-mail',
    'emailNotAuthorized': 'Cet e-mail n\'est pas autorisé à accéder au site. Veuillez contacter le support.',
    'selectProduct': 'Sélectionnez vos produits',
    'chooseProduct': 'Choisissez vos produits et vos options',
    'budgetInfo': 'Limite de budget : Vous pouvez commander jusqu\'à 200 $ au total. Mélangez et associez n\'importe quels produits pour rester dans votre budget.',
    'selectProductLabel': 'Sélectionner un produit',
    'chooseProductPlaceholder': '-- Choisir un produit --',
    'color': 'Couleur',
    'size': 'Taille',
    'selectColor': '-- Sélectionner la couleur --',
    'selectSize': '-- Sélectionner la taille --',
    'quantity': 'Qté',
    'maxToStayWithinBudget': 'Maximum {max} pour rester dans le budget',
    'exceedsBudget': '(Dépasse le budget)',
    'budgetLimitReached': 'Limite de budget atteinte. Retirez des articles pour en ajouter.',
    'pleaseAddProduct': 'Veuillez ajouter au moins un produit à votre panier',
    'logoColor': 'Couleur du logo',
    'selectLogoColor': '-- Sélectionner la couleur du logo --',
    'pleaseSelectLogoColor': 'Veuillez sélectionner une couleur de logo',
    'pleaseSelectProduct': 'Veuillez sélectionner un produit',
    'pleaseSelectColor': 'Veuillez sélectionner une couleur',
    'pleaseSelectSize': 'Veuillez sélectionner une taille',
    'back': '← Retour',
    'abandonCart': 'Abandonner le panier',
    'abandonCartTitle': 'Abandonner le panier?',
    'abandonCartMessage': 'Vous avez des articles dans votre panier. Retourner à la page d\'accueil effacera votre panier et vous devrez recommencer. Êtes-vous sûr de vouloir continuer?',
    'cancel': 'Annuler',
    'continueShipping': 'Continuer vers l\'expédition →',
    'budgetReminderTitle': 'De la place pour en ajouter',
    'budgetReminderMessage': 'Il vous reste',
    'budgetReminderMessageEnd': 'dans votre budget. Voulez-vous ajouter d\'autres produits pour maximiser votre sélection?',
    'addMoreProducts': 'Ajouter des produits',
    'continueAnyway': 'Continuer quand même',
    'currentTotal': 'Total actuel',
    'remainingBudget': 'Restant',
    'budgetExceeded': 'Budget dépassé ! Veuillez retirer des articles ou sélectionner des options moins chères.',
    'addToCart': 'Ajouter au panier',
    'remove': 'Retirer',
    'cart': 'Panier',
    'emptyCart': 'Votre panier est vide',
    'loadingProducts': 'Chargement des produits...',
    'shippingInfo': 'Informations d\'expédition',
    'provideShipping': 'Veuillez fournir vos informations d\'expédition',
    'shippingInstructions': 'Toutes les commandes seront expédiées à l\'adresse ci-dessous.',
    'emailAddress': 'Adresse e-mail',
    'emailSetFromLogin': 'L\'e-mail est défini depuis votre connexion',
    'fullName': 'Nom complet',
    'streetAddress': 'Adresse',
    'addressLine2': 'Ligne d\'adresse 2',
    'city': 'Ville',
    'state': 'État',
    'zipCode': 'Code postal',
    'country': 'Pays',
    'validEmail': 'Veuillez entrer une adresse e-mail valide',
    'fillRequiredFields': 'Veuillez remplir tous les champs obligatoires',
    'continueReview': 'Continuer vers la révision →',
    'reviewOrder': 'Réviser votre commande',
    'reviewInfo': 'Veuillez réviser votre sélection de produits et vos informations d\'expédition avant de soumettre, et n\'hésitez pas à faire une capture d\'écran de ces informations pour votre commodité.',
    'selectedProducts': 'Produits sélectionnés',
    'total': 'Total',
    'submitOrder': 'Soumettre la commande →',
    'submitting': 'Soumission...',
    'orderConfirmed': 'Commande confirmée !',
    'thankYouOrder': 'Merci pour votre commande',
    'yourOrderNumber': 'Votre numéro de commande :',
    'screenshotInfo': 'Faites une capture d\'écran de cette page ou envoyez-vous votre numéro de commande par e-mail en cliquant sur le bouton ci-dessous',
    'emailConfirmation': 'E-mail de confirmation de commande',
    'sizingChart': 'Guide des tailles',
    'sizingChartTitle': 'Guide des tailles',
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
