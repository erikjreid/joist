// Copyright 2022, University of Colorado Boulder

/**
 * The content for the "Localization" tab in the PreferencesDialog.
 *
 * This is still being designed and developed. We expect it to contain a UI component to change the
 * language on the fly when running in the "_all" file. There may also be controls to change out
 * a character set or other artwork to match certain cultures or regions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import { LocalizationModel } from './PreferencesModel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import RegionAndCultureComboBox from './RegionAndCultureComboBox.js';
import LocalePanel from './LocalePanel.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Emitter from '../../../axon/js/Emitter.js';
import PreferencesDialog from './PreferencesDialog.js';

type LocalizationPreferencesPanelOptions = PickRequired<VBoxOptions, 'tandem'>;

class LocalizationPreferencesPanel extends Node {
  private readonly disposeLocalizationPreferencesPanel: () => void;

  public constructor( localizationModel: LocalizationModel, providedOptions: LocalizationPreferencesPanelOptions ) {
    super();

    const disposeEmitter = new Emitter();

    const contentNode = new VBox( {
      spacing: PreferencesDialog.CONTENT_SPACING
    } );

    if ( localizationModel.supportsMultipleLocales ) {
      const localePanel = new LocalePanel( localizationModel.localeProperty );
      contentNode.addChild( localePanel );
      disposeEmitter.addListener( () => localePanel.dispose() );
    }

    if ( localizationModel.regionAndCultureDescriptors.length > 0 ) {
      const comboBox = new RegionAndCultureComboBox( localizationModel.regionAndCultureProperty, localizationModel.regionAndCultureDescriptors );
      contentNode.addChild( comboBox );
      disposeEmitter.addListener( () => comboBox.dispose() );
    }

    localizationModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( providedOptions.tandem );
      disposeEmitter.addListener( () => customContent.dispose() );
      contentNode.addChild( new Node( {
        children: [ customContent ]
      } ) );
    } );

    // center align within this content if there is only one item, otherwise left align all items
    contentNode.align = contentNode.children.length > 1 ? 'left' : 'center';

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // Without a title no indentation is necessary
      contentLeftMargin: 0
    } );

    this.addChild( panelSection );

    this.disposeLocalizationPreferencesPanel = () => {
      disposeEmitter.emit();
    };
  }

  public override dispose(): void {
    this.disposeLocalizationPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'LocalizationPreferencesPanel', LocalizationPreferencesPanel );
export default LocalizationPreferencesPanel;
