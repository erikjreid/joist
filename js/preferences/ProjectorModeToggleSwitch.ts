// Copyright 2022, University of Colorado Boulder

/**
 * A toggle switch for "Projector Mode". Changes the color scheme for better contrast on projectors. The sim must have
 * a projector mode color profile. This toggle switch appears in the PreferencesDialog in the Visual panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { SceneryConstants, VoicingText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesToggleSwitch, { PreferencesToggleSwitchOptions } from './PreferencesToggleSwitch.js';
import JoistStrings from '../JoistStrings.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import Property from '../../../axon/js/Property.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = PreferencesToggleSwitchOptions;
export type ProjectorModeToggleSwitchOptions = SelfOptions & StrictOmit<ParentOptions, 'labelNode' | 'descriptionNode'>;

class ProjectorModeToggleSwitch extends PreferencesToggleSwitch<string> {

  private readonly disposeProjectorModeToggleSwitch: () => void;

  public constructor( colorProfileProperty: Property<string>, providedOptions?: ProjectorModeToggleSwitchOptions ) {
    assert && assert(
    phet.chipper.colorProfiles[ 0 ] !== SceneryConstants.PROJECTOR_COLOR_PROFILE &&
    phet.chipper.colorProfiles.includes( SceneryConstants.PROJECTOR_COLOR_PROFILE ) &&
    phet.chipper.colorProfiles.length === 2 &&
    phet.chipper.colorProfiles[ 0 ] !== phet.chipper.colorProfiles[ 1 ],
      'ProjectorModeToggleSwitch requires sims that support the projector color profile and one other color profile' );

    const projectorModeLabel = new VoicingText( JoistStrings.projectorModeStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const projectorModeDescription = new VoicingText( JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    projectorModeDescription.readingBlockNameResponse = StringUtils.fillIn( JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
      label: JoistStrings.projectorModeStringProperty,
      description: JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty
    } );

    const options = optionize<ProjectorModeToggleSwitchOptions, SelfOptions, ParentOptions>()( {
      labelNode: projectorModeLabel,
      descriptionNode: projectorModeDescription
    }, providedOptions );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( ( colorProfile: string ) => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );

    super( colorProfileProperty, otherColorProfile, SceneryConstants.PROJECTOR_COLOR_PROFILE, options );

    this.disposeProjectorModeToggleSwitch = () => {
      projectorModeLabel.dispose();
      projectorModeDescription.dispose();
    };
  }

  public override dispose(): void {
    this.disposeProjectorModeToggleSwitch();
    super.dispose();
  }
}

joist.register( 'ProjectorModeToggleSwitch', ProjectorModeToggleSwitch );
export default ProjectorModeToggleSwitch;