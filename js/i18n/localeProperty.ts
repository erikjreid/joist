// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../../axon/js/StringProperty.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import { globalKeyStateTracker, KeyboardUtils } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';

const FALLBACK_LOCALE = 'en';

const locales = Object.keys( phet.chipper.strings ).sort();

// Start only with a valid locale, see https://github.com/phetsims/phet-io/issues/1882
const isLocaleValid = ( locale?: string ) => {
  return locale && localeInfoModule[ locale as keyof typeof localeInfoModule ];
};

// We might use a partial locale (e.g. 'en' instead of 'en_US'), so grab this if it exists. It might be the same as
// phet.chipper.locale (that's OK).
const partialLocale = typeof phet.chipper.locale === 'string' ? phet.chipper.locale.slice( 0, 2 ) : undefined;

// Get the "most" valid locale, see https://github.com/phetsims/phet-io/issues/1882
// 'ar_SA' would try 'ar_SA', 'ar', and 'en' (result: ar_SA)
// 'ar_QP' would try 'ar_QP', 'ar', and 'en' (result: ar)
// 'zx_ZX' would try 'zx_ZX', 'zx', and 'en' (result: en)
// NOTE: If the locale doesn't actually have any strings: THAT IS OK! Our string system will use the appropriate
// fallback strings.
const validInitialLocale = isLocaleValid( phet.chipper.locale ) ? phet.chipper.locale :
                           isLocaleValid( partialLocale ) ? partialLocale :
                           FALLBACK_LOCALE;

// Just in case we had an invalid locale, remap phet.chipper.locale to the "corrected" value
phet.chipper.locale = validInitialLocale;

class LocaleProperty extends StringProperty {
  protected override unguardedSet( value: string ): void {
    if ( locales.includes( value ) ) {
      super.unguardedSet( value );
    }
    else {
      assert && assert( false, 'Unsupported locale: ' + value );

      // Do not try to set if the value was invalid
    }
  }
}

const localeProperty = new LocaleProperty( validInitialLocale, {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  validValues: locales
} );

if ( phet.chipper.queryParameters.keyboardLocaleSwitcher ) {

  // DUPLICATION ALERT: don't change these without consulting PHET_IO_WRAPPERS/Client.wireUpKeyboardLocaleSwitcher()
  const FORWARD_KEY = KeyboardUtils.KEY_I;
  const BACKWARD_KEY = KeyboardUtils.KEY_U;

  globalKeyStateTracker.keydownEmitter.addListener( ( event: KeyboardEvent ) => {

    const bump = ( delta: number ) => {

      // Ctrl + u in Chrome on Windows is "view source" in a new tab
      event.preventDefault();

      const index = locales.indexOf( localeProperty.value );
      const nextIndex = ( index + delta + locales.length ) % locales.length;
      localeProperty.value = locales[ nextIndex ];

      // Indicate the new locale on the console
      console.log( localeProperty.value );
    };

    if ( event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey ) {
      if ( KeyboardUtils.isKeyEvent( event, FORWARD_KEY ) ) {
        bump( +1 );
      }
      else if ( KeyboardUtils.isKeyEvent( event, BACKWARD_KEY ) ) {
        bump( -1 );
      }
    }
  } );
}

joist.register( 'localeProperty', localeProperty );

export default localeProperty;
