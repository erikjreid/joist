// Copyright 2013-2022, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import IReadOnlyProperty from '../../axon/js/IReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Color, FocusHighlightPath, NodeOptions } from '../../scenery/js/imports.js';
import { Node } from '../../scenery/js/imports.js';
import { Rectangle } from '../../scenery/js/imports.js';
import { Text } from '../../scenery/js/imports.js';
import { VBox } from '../../scenery/js/imports.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import Tandem from '../../tandem/js/Tandem.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';
import Screen from './Screen.js';

// constants
const HIGHLIGHT_SPACING = 4;
const getHighlightWidth = ( overlay: Node ) => overlay.width + ( 2 * HIGHLIGHT_SPACING );

type SelfOptions = {
  maxButtonWidth?: number | null;
}
type NavigationBarScreenButtonOptions = SelfOptions & NodeOptions;

class NavigationBarScreenButton extends Node {
  private readonly buttonModel: PushButtonModel;

  /**
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param screenProperty
   * @param screen
   * @param simScreenIndex - the index (within sim screens only) of the screen corresponding to this button
   * @param navBarHeight
   * @param [providedOptions]
   */
  constructor( navigationBarFillProperty: IReadOnlyProperty<Color>, screenProperty: Property<Screen<any, any>>, screen: Screen<any, any>, simScreenIndex: number, navBarHeight: number, providedOptions: NavigationBarScreenButtonOptions ) {

    assert && assert( screen.nameProperty.value, `name is required for screen ${simScreenIndex}` );
    assert && assert( screen.navigationBarIcon, `navigationBarIcon is required for screen ${screen.nameProperty.value}` );

    const options = optionize<NavigationBarScreenButtonOptions, SelfOptions, NodeOptions>()( {
      cursor: 'pointer',
      tandem: Tandem.REQUIRED,
      phetioDocumentation: `Button in the navigation bar that selects the '${screen.tandem.name}' screen`,
      maxButtonWidth: null, // {number|null} the maximum width of the button, causes text and/or icon to be scaled down if necessary

      // pdom
      tagName: 'button',
      containerTagName: 'li',
      descriptionContent: screen.descriptionContent,
      appendDescription: true
    }, providedOptions );

    assert && assert( !options.innerContent, 'NavigationBarScreenButton sets its own innerContent' );

    super();

    screen.pdomDisplayNameProperty.link( name => {
      this.innerContent = name;
    } );

    assert && assert( screen.navigationBarIcon, 'navigationBarIcon should exist' );
    // icon
    const icon = new Node( {
      children: [ screen.navigationBarIcon! ], // wrap in case this icon is used in multiple place (eg, home screen and navbar)
      maxHeight: 0.625 * navBarHeight,
      tandem: options.tandem.createTandem( 'icon' ),

      // pdom - the icon may have focusable components in its graphic, but they should be invisible for Interactive
      // Description, all accessibility should go through this button
      pdomVisible: false
    } );

    // frame around the icon
    const iconFrame = new Rectangle( 0, 0, icon.width, icon.height );

    const iconAndFrame = new Node( {
      children: [ icon, iconFrame ]
    } );

    assert && assert( screen.nameProperty.value, 'screen name should be defined' );
    const text = new Text( screen.nameProperty.value!, {
      font: new PhetFont( 10 ),
      tandem: options.tandem.createTandem( 'text' ),

      // @ts-ignore
      textPropertyOptions: { phetioReadOnly: true } // text is updated via screen.nameProperty
    } );

    // spacing set by Property link below
    const iconAndText = new VBox( {
      children: [ iconAndFrame, text ],
      pickable: false,
      usesOpacity: true, // hint, since we change its opacity
      maxHeight: navBarHeight
    } );

    // add a transparent overlay for input handling and to size touchArea/mouseArea
    const overlay = new Rectangle( { rectBounds: iconAndText.bounds } );

    // highlights
    const highlightWidth = getHighlightWidth( overlay );
    const brightenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: iconAndText.center,
      fill: 'white'
    } );
    const darkenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: iconAndText.center,
      fill: 'black'
    } );

    // Is this button's screen selected?
    const selectedProperty = new DerivedProperty( [ screenProperty ], currentScreen => ( currentScreen === screen ) );

    // (phet-io) Create the button model, needs to be public so that PhET-iO wrappers can hook up to it if
    // needed. Note it shares a tandem with this, so the emitter will be instrumented as a child of the button.
    // Note that this buttonModel will always be phetioReadOnly false despite the parent value.
    this.buttonModel = new PushButtonModel( {
      listener: () => {
        screenProperty.value = screen;
      },
      tandem: options.tandem,

      // Navigation bar screen buttons by default do not have a featured enabledProperty.
      enabledPropertyOptions: { phetioFeatured: false }
    } );

    // Hook up the input listener
    const pressListener = this.buttonModel.createPressListener( {
      tandem: options.tandem.createTandem( 'pressListener' ),

      // @ts-ignore
      phetioDocumentation: 'Indicates when the screen button has been pressed or released'
    } );
    this.addInputListener( pressListener );

    // manage interaction feedback
    Property.multilink(
      [ selectedProperty, this.buttonModel.looksPressedProperty, this.buttonModel.looksOverProperty, navigationBarFillProperty, this.buttonModel.enabledProperty ],
      ( selected: boolean, looksPressed: boolean, looksOver: boolean, navigationBarFill: Color, enabled: boolean ) => {

        const useDarkenHighlights = !navigationBarFill.equals( Color.BLACK );

        // Color match yellow with the PhET Logo
        const selectedTextColor = useDarkenHighlights ? 'black' : PhetColorScheme.BUTTON_YELLOW;
        const unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';

        text.fill = selected ? selectedTextColor : unselectedTextColor;
        iconAndText.opacity = selected ? 1.0 : ( looksPressed ? 0.65 : 0.5 );

        // @ts-ignore
        brightenHighlight.visible = !useDarkenHighlights && enabled && ( looksOver || looksPressed );

        // @ts-ignore
        darkenHighlight.visible = useDarkenHighlights && enabled && ( looksOver || looksPressed );

        // Put a frame around the screen icon, depending on the navigation bar background color.
        if ( screen.showScreenIconFrameForNavigationBarFill === 'black' && navigationBarFill.equals( Color.BLACK ) ) {
          iconFrame.stroke = PhetColorScheme.SCREEN_ICON_FRAME;
        }

        else if ( screen.showScreenIconFrameForNavigationBarFill === 'white' && navigationBarFill.equals( Color.WHITE ) ) {
          iconFrame.stroke = 'black'; // black frame on a white navbar
        }
        else {
          iconFrame.stroke = 'transparent'; // keep the same bounds for simplicity
        }
      } );

    // Keep the cursor in sync with if the button is enabled. This doesn't need to be disposed.
    this.buttonModel.enabledProperty.link( enabled => {

      // @ts-ignore
      this.cursor = enabled ? options.cursor : null;
    } );

    // Update the button's layout
    const updateLayout = () => {

      // adjust the vertical space between icon and text, see https://github.com/phetsims/joist/issues/143
      iconAndText.spacing = Math.max( 0, 12 - text.height );

      // adjust the overlay
      overlay.setRectBounds( iconAndText.bounds );

      // adjust the highlights
      brightenHighlight.spacing = darkenHighlight.spacing = getHighlightWidth( overlay );
      brightenHighlight.center = darkenHighlight.center = iconAndText.center;
    };

    // Update the button's text and layout when the screen name changes
    screen.nameProperty.link( name => {

      // @ts-ignore
      text.text = name;
    } );
    iconAndText.boundsProperty.lazyLink( updateLayout );
    text.boundsProperty.link( updateLayout );

    this.children = [
      iconAndText,
      overlay,
      brightenHighlight,
      darkenHighlight
    ];

    const needsIconMaxWidth = options.maxButtonWidth && ( this.width > options.maxButtonWidth );

    // Constrain text and icon width, if necessary
    if ( needsIconMaxWidth ) {

      // @ts-ignore
      text.maxWidth = icon.maxWidth = options.maxButtonWidth - ( this.width - iconAndText.width );
    }
    else {
      // Don't allow the text to grow larger than the icon if changed later on using PhET-iO, see #438
      // Text is allowed to go beyond the bounds of the icon, hence we use `this.width` instead of `icon.width`
      text.maxWidth = this.width;
    }

    // @ts-ignore
    needsIconMaxWidth && assert && assert( Utils.toFixed( this.width, 0 ) === Utils.toFixed( options.maxButtonWidth, 0 ),
      `this.width ${this.width} !== options.maxButtonWidth ${options.maxButtonWidth}` );

    // pdom - Pass a shape to the focusHighlight to prevent dilation, then tweak the top up just a hair.
    const highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.withMinY( this.bounds.minY - highlightLineWidth / 2 ) );

    this.mutate( options );
  }
}

joist.register( 'NavigationBarScreenButton', NavigationBarScreenButton );
export default NavigationBarScreenButton;