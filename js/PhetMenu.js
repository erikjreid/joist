// Copyright 2002-2013, University of Colorado Boulder

/**
 * The "PhET" menu.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  // imports
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AboutDialog = require( 'JOIST/AboutDialog' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var log = require( 'AXON/log' );

  // constants
  var FONT_SIZE = '18px';
  var HIGHLIGHT_COLOR = '#a6d2f4';

  // Creates a menu item that highlights and fires.
  var createMenuItem = function( text, width, height, callback ) {

    var X_MARGIN = 5;
    var Y_MARGIN = 3;
    var CORNER_RADIUS = 5;

    var textNode = new Text( text, { fontSize: FONT_SIZE } );
    var highlight = new Rectangle( 0, 0, width + X_MARGIN + X_MARGIN, height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    var menuItem = new Node( { cursor: 'pointer' } );
    menuItem.addChild( highlight );
    menuItem.addChild( textNode );

    textNode.left = highlight.left + X_MARGIN; // text is left aligned
    textNode.centerY = highlight.centerY;

    menuItem.addInputListener( {
      enter: function() { highlight.fill = HIGHLIGHT_COLOR; },
      exit: function() { highlight.fill = null; }
    } );
    menuItem.addInputListener( new ButtonListener( {fire: callback } ) );

    return menuItem;
  };

  //TODO: The popup menu should scale with the size of the screen
  function PhetMenu( sim, options ) {

    options = _.extend( {renderer: 'svg'}, options );

    var thisMenu = this;
    Node.call( thisMenu );

    /*
     * Description of the items in the menu. Each descriptor has these properties:
     * {String} text - the item's text
     * {Boolean} present - whether the item should be added to the menu
     * {Function} callback - called when the item fires
     */
    var itemDescriptors = [
      {
        text: 'PhET Homepage',
        present: true,
        callback: function() {
          window.open( "http://phet.colorado.edu" );
          window.focus();
        }},
      {
        text: 'Output Log',
        present: log.enabled ? true : false,
        callback: function() {
          console.log( JSON.stringify( log.log ) );
        }},
      {
        text: 'About...',
        present: true,
        callback: function() {
          var aboutDialog = new AboutDialog( sim );
          sim.addChild( aboutDialog );
          var aboutDialogListener = {down: function() {
            aboutDialog.removeInputListener( aboutDialogListener );
            aboutDialog.detach();
          }};
          aboutDialog.addInputListener( aboutDialogListener );
        }}
    ];

    // Menu items have uniform size, so compute the max text dimensions.
    var keepItemDescriptors = _.filter( itemDescriptors, function( itemDescriptor ) {return itemDescriptor.present;} );
    var textNodes = _.map( keepItemDescriptors, function( item ) {return new Text( item.text, {fontSize: FONT_SIZE} );} );
    var maxTextWidth = _.max( textNodes, function( node ) {return node.width;} ).width;
    var maxTextHeight = _.max( textNodes, function( node ) {return node.height;} ).height;

    // Create the menu items.
    var items = _.map( itemDescriptors, function( itemDescriptor ) {
      return createMenuItem( itemDescriptor.text, maxTextWidth, maxTextHeight, itemDescriptor.callback );
    } );

    // Create a comic-book-style bubble.
    var itemWidth = _.max( items,function( item ) {return item.width;} ).width;
    var itemHeight = _.max( items,function( item ) {return item.height;} ).height;
    var X_MARGIN = 5;
    var Y_MARGIN = 5;

    var bubbleWidth = itemWidth + X_MARGIN + X_MARGIN;
    var bubbleHeight = itemHeight * items.length + Y_MARGIN + Y_MARGIN;
    var bubble = new Rectangle( 0, 0, bubbleWidth, bubbleHeight, 8, 8, {fill: 'white', lineWidth: 1, stroke: 'black'} );

    var tail = new Shape();
    tail.moveTo( bubbleWidth - 20, bubbleHeight - 2 );
    tail.lineToRelative( 0, 20 );
    tail.lineToRelative( -20, -20 );
    tail.close();
    thisMenu.addChild( bubble );
    thisMenu.addChild( new Path( {shape: tail, fill: 'white'} ) );

    var tailOutline = new Shape();
    tailOutline.moveTo( bubbleWidth - 20, bubbleHeight );
    tailOutline.lineToRelative( 0, 20 - 2 );
    tailOutline.lineToRelative( -18, -18 );
    thisMenu.addChild( new Path( {shape: tailOutline, stroke: 'black', lineWidth: 1} ) );

    // Populate the bubble with menu items.
    var y = Y_MARGIN;
    _.each( items, function( item ) {
      item.top = y;
      item.left = X_MARGIN;
      thisMenu.addChild( item );

      //TODO separators should be specified in itemDescriptors
      // Put a separator before the last item.
      if ( item === items[items.length - 2] ) {
        thisMenu.addChild( new Path( {shape: Shape.lineSegment( 8, y + itemHeight, bubbleWidth - 8, y + itemHeight ), stroke: 'gray', lineWidth: 1} ) );
      }
      y += itemHeight;
    } );

    thisMenu.mutate( options );
  }

  inherit( Node, PhetMenu );

  return PhetMenu;
} );