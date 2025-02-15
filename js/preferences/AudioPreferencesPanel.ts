// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { HBox, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesType from './PreferencesType.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';

// constants
const audioFeaturesStringProperty = JoistStrings.preferences.tabs.audio.audioFeatures.titleStringProperty;

type AudioPreferencesPanelOptions = PickRequired<PreferencesPanelOptions, 'tandem'>;

class AudioPreferencesTabPanel extends PreferencesPanel {
  private readonly disposeAudioPreferencesPanel: () => void;

  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param selectedTabProperty
   * @param tabVisibleProperty
   * @param providedOptions
   */
  public constructor( audioModel: AudioModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions: AudioPreferencesPanelOptions ) {
    super( PreferencesType.AUDIO, selectedTabProperty, tabVisibleProperty, {
      labelContent: audioFeaturesStringProperty
    } );

    // Some contents of this Dialog will be dynamically removed. Dont resize when this happens because we don't want
    // to shift contents of the entire Preferences dialog.
    const contentOptions: VBoxOptions = { align: 'left', spacing: PreferencesDialog.CONTENT_SPACING, excludeInvisibleChildrenFromBounds: false };
    const leftContent = new VBox( contentOptions );
    const rightContent = new VBox( contentOptions );

    if ( audioModel.supportsVoicing ) {
      const voicingPanelSection = new VoicingPanelSection( audioModel );
      leftContent.addChild( voicingPanelSection );
      this.disposeEmitter.addListener( () => voicingPanelSection.dispose() );
    }

    if ( audioModel.supportsSound ) {

      // If only one of the audio features are in use, do not include the toggle switch to
      // enable/disable that feature because the control is redundant. The audio output should go
      // through the "Audio Features" toggle only.
      const hideSoundToggle = audioModel.supportsVoicing !== audioModel.supportsSound;

      const soundPanelSection = new SoundPanelSection( audioModel, {
        includeTitleToggleSwitch: !hideSoundToggle
      } );
      rightContent.addChild( soundPanelSection );
      this.disposeEmitter.addListener( () => soundPanelSection.dispose() );
    }

    const sections = new HBox( {
      align: 'top',
      spacing: 10,
      children: [ leftContent, rightContent ]
    } );

    audioModel.customPreferences.forEach( ( customPreference, i ) => {
      const container = i % 2 === 0 ? leftContent : rightContent;
      const customContent = customPreference.createContent( providedOptions.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( {
        contentNode: customContent,
        contentLeftMargin: 0
      } );
      container.addChild( preferencesPanelSection );
      this.disposeEmitter.addListener( () => {
        customContent.dispose();
        preferencesPanelSection.dispose();
      } );

    } );

    const audioFeaturesText = new Text( audioFeaturesStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const allAudioSwitch = new PreferencesToggleSwitch( audioModel.audioEnabledProperty, false, true, {
      labelNode: audioFeaturesText,
      a11yLabel: audioFeaturesStringProperty
    } );

    const soundEnabledListener = ( enabled: boolean ) => {
      sections.enabled = enabled;
    };

    audioModel.audioEnabledProperty.link( soundEnabledListener );

    const panelContent = new VBox( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ]
    } );
    this.addChild( panelContent );

    this.disposeAudioPreferencesPanel = () => {
      leftContent.dispose();
      rightContent.dispose();
      allAudioSwitch.dispose();
      audioFeaturesText.dispose();
      sections.dispose();
      panelContent.dispose();
      audioModel.audioEnabledProperty.unlink( soundEnabledListener );
    };
  }

  public override dispose(): void {
    this.disposeAudioPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;