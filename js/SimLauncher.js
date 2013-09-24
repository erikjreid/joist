// Copyright 2002-2013, University of Colorado Boulder
/**
 * Launches a PhET Simulation, after preloading the specified images.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var loadedResourceCount = 0;

  return {
    /**
     * Launch the Sim by preloading the images and calling the callback.
     *
     * TODO: add an awesome loading screen
     *
     * @param {*} simImageLoader an object with an {Array<String>} imageNames property
     * @param callback the callback function which should create and start the sim, given that the images are loaded
     */
    launch: function( simImageLoader, callback ) {

      // image elements to remove once we are fully loaded
      var elementsToRemove = [];

      // in Safari (but right now not other browsers), the images are not fully loaded by the time this code is reached,
      // so we don't send the immediate completion
      var delayCompletionEvent = false;

      function doneLoadingImages() {
        loadedResourceCount++;
        if ( loadedResourceCount === 1 ) {
          $( '#splash' ).remove();
          callback();
        }
      }

      //Load the images for a single imageLoader.
      function load( imageLoader, path ) {
        var loadedImages = {};
        imageLoader.getImage = function( name ) { return loadedImages[name]; };

        imageLoader.imageNames.forEach( function( image ) {
          var filename = path + '/' + image;

          // check to see if we have a reference to this image in the DOM (included with data URI in base64)
          loadedImages[image] = document.getElementById( filename );
          if ( loadedImages[image] ) {
            // window.console && console.log && console.log( 'loaded ' + filename + ' with dimensions: ' + loadedImages[image].width + 'x' + loadedImages[image].height );
            if ( loadedImages[image].width === 0 || loadedImages[image].height === 0 ) {
              // if it exists but doesn't have dimensions, we wait until window's onload to trigger the "all images loaded" signal
              delayCompletionEvent = true;
            }

            // mark the element to be removed from the DOM
            elementsToRemove.push( loadedImages[image] );
          }
          else {
            // TODO: only print warning if we detect we are a production / release candidate build
            window.console && console.log && console.log( 'WARNING: could not find image: ' + filename + '.' );
          }
        } );
      }

      // load images and configure the image loader
      load( simImageLoader, 'images' );

      // if image dimensions exist, immediately fire the "all images loaded" event
      if ( !delayCompletionEvent ) {
        var loaded = 0;

        //For the images that were written to base64 format using requirejs, make sure they are loaded.
        //img.src = base64 is asynchronous on IE10 and OSX/Safari, so we have to make sure they loaded before returning.
        if ( window.phetImages ) {
          for ( var i = 0; i < window.phetImages.length; i++ ) {
            var phetImage = window.phetImages[i];
            phetImage.onload = function() {
              loaded++;
              if ( loaded === window.phetImages.length ) {
                doneLoadingImages();
              }
            };
          }
        }
        else {
          doneLoadingImages();
        }
      }

      $( window ).load( function() {
        // if images were not loaded immediately, signal the "all images loaded" event
        if ( delayCompletionEvent ) {
          doneLoadingImages();
        }

        // we wait for here to remove the images from the DOM, otherwise IE9/10 treat the images as completely blank!
        _.each( elementsToRemove, function( element ) {

          //TODO: Why is this null sometimes?
          if ( element.parentNode ) {
            element.parentNode.removeChild( element );
          }
        } );
      } );
    }};
} );