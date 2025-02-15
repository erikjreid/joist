// Copyright 2021-2022, University of Colorado Boulder

/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { GridBox, Node, NodeOptions, PDOMValueType, SceneryConstants } from '../../../scenery/js/imports.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance, { TAlertable } from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';

// This ToggleSwitch is not
type ConstrainedToggleSwitchOptions = StrictOmit<ToggleSwitchOptions, 'innerContent' | 'voicingIgnoreVoicingManagerProperties'>;

type SelfOptions = {

  // if provided, a label Node to the left of the toggle switch control
  labelNode?: null | Node;

  // horizontal spacing between label for the component and toggle switch IF there is no descriptionNode.
  // If a descriptionNode is provided, layout of the labelNode will be relative to the description.
  // If there is a leftValueLabel it will be the horizontal spacing between the labelNode and the leftValueLabel.
  labelSpacing?: number;

  // if provided, a label to the left and right of the switch describing the state values
  leftValueLabel?: null | Node;
  rightValueLabel?: null | Node;

  // horizontal spacing between the toggle switch and left/right value labels
  valueLabelXSpacing?: 8;

  // if provided, a Node under the ToggleSwitch and label that is meant to describe the purpose of the switch
  descriptionNode?: null | Node;

  // vertical spacing between ToggleSwitch and description Node
  descriptionSpacing?: 5;

  // Sets both the inner content and the voicing response for the toggle switch on focus.
  // NOTE?: Seeing more overlap like this between PDOM and voicing (which is good) but not sure how it will
  // all work yet. This option is the first of its kind.
  a11yLabel?: null | PDOMValueType;

  // a11y
  // If provided, these responses will be spoken to describe the change in simulation context
  // for both Voicing and Interactive Description features when the value changes to either leftValue or
  // rightValue.
  leftValueContextResponse?: TAlertable;
  rightValueContextResponse?: TAlertable;

  // options passed to the actual ToggleSwitch
  toggleSwitchOptions?: ConstrainedToggleSwitchOptions;
};

export type PreferencesToggleSwitchOptions = SelfOptions & NodeOptions;

class PreferencesToggleSwitch<T> extends Node {
  private readonly disposePreferencesToggleSwitch: () => void;
  public readonly toggleSwitch: ToggleSwitch<T>;

  public constructor( property: Property<T>, leftValue: T, rightValue: T, providedOptions?: PreferencesToggleSwitchOptions ) {
    const options = optionize<PreferencesToggleSwitchOptions, SelfOptions, NodeOptions>()( {
      labelNode: null,
      labelSpacing: 10,
      leftValueLabel: null,
      rightValueLabel: null,
      valueLabelXSpacing: 8,
      descriptionNode: null,
      descriptionSpacing: 5,
      a11yLabel: null,
      leftValueContextResponse: null,
      rightValueContextResponse: null,
      toggleSwitchOptions: {
        size: new Dimension2( 36, 18 ),
        trackFillRight: '#64bd5a'
      }
    }, providedOptions );

    super( options );

    this.toggleSwitch = new ToggleSwitch( property, leftValue, rightValue, merge( options.toggleSwitchOptions, {

      // enabled:true by default, but disable if fuzzing when supporting voicing
      enabled: !( phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing ),

      // pdom
      innerContent: options.a11yLabel,

      // voicing
      voicingIgnoreVoicingManagerProperties: true,
      voicingNameResponse: options.a11yLabel,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } ) );

    if ( options.leftValueLabel ) {
      options.leftValueLabel.right = this.toggleSwitch.left - options.valueLabelXSpacing;
      options.leftValueLabel.centerY = this.toggleSwitch.centerY;
      this.toggleSwitch.addChild( options.leftValueLabel );
    }
    if ( options.rightValueLabel ) {
      options.rightValueLabel.left = this.toggleSwitch.right + options.valueLabelXSpacing;
      options.rightValueLabel.centerY = this.toggleSwitch.centerY;
      this.toggleSwitch.addChild( options.rightValueLabel );
    }

    // a11y - Describe the change in value if context responses were provided in options. Listener needs to be
    // removed on dispose.
    const valueListener = ( value: T ) => {
      const alert = value === rightValue ? options.rightValueContextResponse : options.leftValueContextResponse;

      if ( alert ) {
        this.alertDescriptionUtterance( alert );
        this.toggleSwitch.voicingSpeakResponse( {
          contextResponse: Utterance.alertableToText( alert )
        } );
      }
    };
    property.lazyLink( valueListener );

    // This component manages disabledOpacity, we don't want it to compound over subcomponents.
    this.toggleSwitch.disabledOpacity = 1;
    this.disabledOpacity = SceneryConstants.DISABLED_OPACITY;

    this.enabledProperty.link( enabled => {
      this.toggleSwitch.enabled = enabled;
    } );

    // Layout using GridBox and layoutOptions will accomplish the following when all components are available.
    // [[labelNode]]         [[ToggleSwitch]]
    // [[descriptionNode                   ]]
    const gridBox = new GridBox( {
      ySpacing: options.descriptionSpacing
    } );
    this.addChild( gridBox );

    this.toggleSwitch.layoutOptions = {
      row: 0,
      column: 1,
      xAlign: 'right'
    };
    gridBox.addChild( this.toggleSwitch );

    if ( options.labelNode ) {
      assert && assert( options.labelNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      options.labelNode.layoutOptions = {
        row: 0,
        column: 0,
        xAlign: 'left',
        rightMargin: options.labelSpacing
      };
      gridBox.addChild( options.labelNode );
    }

    if ( options.descriptionNode ) {
      assert && assert( options.descriptionNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      options.descriptionNode.layoutOptions = {
        row: 1,
        column: 0,
        horizontalSpan: 2,
        xAlign: 'left'
      };
      gridBox.addChild( options.descriptionNode );
    }

    this.disposePreferencesToggleSwitch = () => {
      property.unlink( valueListener );
      this.toggleSwitch.dispose();
      gridBox.dispose();
    };
  }

  public override dispose(): void {
    this.disposePreferencesToggleSwitch();
    super.dispose();
  }
}

joist.register( 'PreferencesToggleSwitch', PreferencesToggleSwitch );
export default PreferencesToggleSwitch;
