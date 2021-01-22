// Copyright 2013-2021, University of Colorado Boulder
/**
 * Singleton which launches a PhET Simulation, after using PHET_CORE/asyncLoader to make sure resources such as images,
 * sounds, or dynamic modules have finished loading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

// See below for dynamic imports, which must be locked.
let phetioEngine = null; // {null|PhetioEngine}

const unlockBrand = asyncLoader.createLock( { name: 'brand' } );
import( /* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js` ).then( module => unlockBrand() );

if ( Tandem.PHET_IO_ENABLED ) {
  const unlockPhetioEngine = asyncLoader.createLock( { name: 'phetioEngine' } );
  import( /* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js' ).then( module => {
    phetioEngine = module.default;
    unlockPhetioEngine();
  } );
}

class SimLauncher {
  constructor() {

    // @private {boolean} - Marked as true when simLauncher has finished its work cycle and control is given over to the
    // simulation to finish initialization.
    this.launchComplete = false;
  }

  /**
   * Launch the Sim by preloading the images and calling the callback.
   * @public - to be called by main()s everywhere
   *
   * @param {function} callback - the callback function which should create and start the sim, given that all async
   *                              content is loaded
   */
  launch( callback ) {
    assert && assert( !window.phet.joist.launchCalled, 'Tried to launch twice' );

    asyncLoader.readyToProceed( () => {

      window.phet.joist.launchSimulation = () => {
        assert && assert( !this.launchComplete, 'should not have completed launching the sim yet' );
        this.launchComplete = true;

        // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
        // wants have been set up by now.
        if ( Tandem.PHET_IO_ENABLED ) {
          phetioEngine.onCrossFrameListenersReady();
        }

        // Instantiate the sim and show it.
        callback();
      };

      // PhET-iO simulations support an initialization phase (before the sim launches)
      if ( Tandem.PHET_IO_ENABLED ) {
        phetioEngine.initialize(); // calls back to window.phet.joist.launchSimulation
      }

      if ( phet.chipper.queryParameters.postMessageOnReady ) {
        window.parent && window.parent.postMessage( JSON.stringify( {
          type: 'ready',
          url: window.location.href
        } ), '*' );
      }

      if ( ( Tandem.PHET_IO_ENABLED && !phet.preloads.phetio.queryParameters.phetioStandalone ) ||
           phet.chipper.queryParameters.playbackMode ) {

        // Wait for phet-io to finish adding listeners. It will direct the launch from there.
      }
      else {
        window.phet.joist.launchSimulation();
      }
    } );

    // Signify that the simLauncher was called, see https://github.com/phetsims/joist/issues/142
    window.phet.joist.launchCalled = true;
  }
}

const simLauncher = new SimLauncher();

joist.register( 'simLauncher', simLauncher );

export default simLauncher;