// Copyright 2015-2022, University of Colorado Boulder

/**
 * Screen for the home screen, which shows icons for selecting the sim content screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import { Color, Node } from '../../scenery/js/imports.js';
import HomeScreenKeyboardHelpContent from './HomeScreenKeyboardHelpContent.js';
import HomeScreenModel from './HomeScreenModel.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import Screen, { ScreenOptions } from './Screen.js';

// constants
const homeStringProperty = JoistStrings.a11y.homeStringProperty;
const BACKGROUND_COLOR = Color.BLACK;

type SelfOptions = {
  warningNode: Node | null;
};
type HomeScreenOptions = SelfOptions & ScreenOptions;

class HomeScreen extends Screen<HomeScreenModel, HomeScreenView> {
  public static BACKGROUND_COLOR: Color;

  public constructor(
    simNameProperty: TReadOnlyProperty<string>,
    getScreenProperty: () => Property<Screen>,
    simScreens: Screen[],
    activeSimScreensProperty: ReadOnlyProperty<Screen[]>,
    providedOptions: HomeScreenOptions
  ) {

    const options = optionize<HomeScreenOptions, SelfOptions, ScreenOptions>()( {

      // TODO get this color from LookAndFeel, see https://github.com/phetsims/joist/issues/222
      backgroundColorProperty: new Property( BACKGROUND_COLOR ),

      name: homeStringProperty,

      createKeyboardHelpNode: () => new HomeScreenKeyboardHelpContent(),

      // phet-io
      instrumentNameProperty: false // requested by designers, see https://github.com/phetsims/joist/issues/627
    }, providedOptions );

    super(
      // at the time of construction, the Sim.screenProperty is not yet assigned (because it may itself include the
      // HomeScreen), so we must use a function to lazily get it after it is assigned
      () => new HomeScreenModel( getScreenProperty(), simScreens, activeSimScreensProperty, options.tandem.createTandem( 'model' ) ),
      model => new HomeScreenView( simNameProperty, model, {
        warningNode: options.warningNode,
        tandem: options.tandem.createTandem( 'view' )
      } ),
      options
    );
  }
}

// (read-only)
HomeScreen.BACKGROUND_COLOR = BACKGROUND_COLOR;

joist.register( 'HomeScreen', HomeScreen );

export default HomeScreen;