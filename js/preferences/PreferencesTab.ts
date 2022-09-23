// Copyright 2021, University of Colorado Boulder

/**
 * A single tab of the PreferencesDialog. Selecting this PreferencesTab makes its associated PreferencesPanel
 * visible in the dialog.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import { FocusHighlightPath, HBox, Line, Node, NodeOptions, PressListener, Rectangle, Text, Voicing, VoicingOptions } from '../../../scenery/js/imports.js';
import PreferencesType from './PreferencesType.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import TProperty from '../../../axon/js/TProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import PreferencesDialog from './PreferencesDialog.js';
import Multilink from '../../../axon/js/Multilink.js';
import JoistStrings from '../JoistStrings.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = {

  // An additional icon to display to the right of the label text for this tab.
  iconNode?: Node | null;
};
type PreferencesTabOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & StrictOmit<NodeOptions, 'children'>;
type ParentOptions = NodeOptions & VoicingOptions;

class PreferencesTab extends Voicing( Node ) {

  public readonly value: PreferencesType;
  private readonly disposeTab: () => void;

  /**
   * @param label - text label for the tab
   * @param property
   * @param value - PreferencesType shown when this tab is selected
   * @param providedOptions
   */
  public constructor( label: TReadOnlyProperty<string>, property: TProperty<PreferencesType>, value: PreferencesType, providedOptions: PreferencesTabOptions ) {

    const options = optionize<PreferencesTabOptions, SelfOptions, ParentOptions>()( {
      iconNode: null,

      tandem: Tandem.REQUIRED,
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li'
    }, providedOptions );

    // Visual contents for the tab, label Text and optional icon Node
    const textNode = new Text( label, PreferencesDialog.TAB_OPTIONS );
    const tabContents: Node[] = [ textNode ];
    if ( options.iconNode ) {
      tabContents.push( options.iconNode );
    }
    const contentsBox = new HBox( {
      children: tabContents,
      spacing: 8
    } );

    // background Node behind the tab contents for layout spacing and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( {
      children: [ contentsBox ]
    } );
    contentsBox.boundsProperty.link( bounds => {
      backgroundNode.rectBounds = bounds.dilatedXY( 15, 10 );
    } );

    // Pink underline Node to indicate which tab is selected
    const underlineNode = new Line( 0, 0, 0, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5
    } );
    contentsBox.boundsProperty.link( bounds => {
      underlineNode.x2 = bounds.width;
      underlineNode.centerTop = bounds.centerBottom.plusXY( 0, 5 );
    } );

    super( options );
    this.children = [ backgroundNode, underlineNode ];

    label.link( string => {
      this.innerContent = string;
    } );

    this.value = value;

    const voicingMultilink = Multilink.multilink( [ JoistStrings.a11y.preferences.tabs.tabResponsePatternStringProperty, label ], ( pattern, labelString ) => {
      this.voicingNameResponse = StringUtils.fillIn( pattern, {
        title: labelString
      } );
    } );

    const pressListener = new PressListener( {
      press: () => {
        property.set( value );

        // speak the object response on activation
        this.voicingSpeakNameResponse();
      },

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );
    this.addInputListener( pressListener );

    Multilink.multilink( [ property, pressListener.isOverProperty ], ( selectedTab, isOver ) => {
      backgroundNode.opacity = selectedTab === value ? 1 :
                               isOver ? 0.8 :
                               0.6;

      this.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
    } );

    this.disposeTab = () => {
      pressListener.dispose();
      voicingMultilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeTab();
    super.dispose();
  }
}


joist.register( 'PreferencesTab', PreferencesTab );
export default PreferencesTab;