
function computeDice() {
    var totalCells = jQuery('.cell').length;
    var maskedCells = jQuery('.cell.mask').length;
    var detectedCells = jQuery('.cell.detected').length;
    var bothCells = jQuery('.cell.detected.mask').length;

    // common element * 2 / (total number of elements on both sides)

    jQuery('#common').text(bothCells);

    jQuery('#side1').text(maskedCells);
    jQuery('#side2').text(detectedCells);
    jQuery('#dice').text((bothCells * 2 / (maskedCells + detectedCells)).toFixed(4));
    return bothCells * 2 / (maskedCells + detectedCells);
}

var totalAttempts = 0;

// get a specific dice score by adding or removing detected cells
function getCloserToTargetDice(targetDice) {
    var bestDice = computeDice();
    var bestCell = null;

    var maskedCells = jQuery('.cell.mask').length;
    if (maskedCells < 1) {
        alert('Please mask at least one cell first!');
        return;
    }

    totalAttempts++;
    if (totalAttempts > 100) {
        jQuery('#spinner').hide();
        alert('Could not reach target dice score, stopped after 1000 attempts. Current dice score: ' + bestDice.toFixed(4));
        totalAttempts = 0;
        return;
    }

    if (bestDice < targetDice+0.02 && bestDice > targetDice-0.02) {
        // we are done, do an indication for that...
        jQuery('#spinner').hide();
        totalAttempts = 0;
        return; // we are done
    }

    // toggle a random cell and see if the dice score improves
    for (var attempt = 0; attempt < 10; attempt++) {
        var cells = jQuery('.cell').toArray();
        var idx = Math.floor(Math.random() * cells.length);
        jQuery(cells[idx]).toggleClass('detected');
        var newDice = computeDice();
        if (Math.abs(newDice - targetDice) < Math.abs(bestDice - targetDice)) {
            // keep the change
            bestDice = newDice;
            bestCell = cells[idx];
            break; // exit the loop
        } else {
            // revert the change
            jQuery(cells[idx]).toggleClass('detected');
        }
    }

    setTimeout(function improveDice() {
        var targetDice = parseFloat(jQuery('#target').val());
        // do this a couple of times
        jQuery('#spinner').show();
        getCloserToTargetDice(targetDice);
    },300);
}


jQuery(document).ready(function() {
    jQuery('#spinner').hide();

    // create a grid
    for (var i = 0; i < 10; i++) {
        var row = jQuery('<div class="cellrow"></div>');
        for (var j = 0; j < 10; j++) {
            var cell = jQuery('<div class="cell"></div>');
            row.append(cell);
        }
        jQuery('#grid').append(row);
    }

    // paint the mask
    jQuery('#grid').on('click', '.cell', function(event) {
        if (event.shiftKey) {
            jQuery(this).toggleClass('detected');
        } else {
            // based on the switch we can draw both now
            if (jQuery('#switchDrawMode').is(':checked')) {
                jQuery(this).toggleClass('detected'); 
            } else {
                jQuery(this).toggleClass('mask');
            }
        }
        document.getSelection().removeAllRanges();
        event.preventDefault(); // prevent shift to have a select effect

        // recompute the dice coefficient
        computeDice();
    });

    jQuery('#target').on('change', function() {
        var targetDice = parseFloat(jQuery(this).val());
        // do this a couple of times
        totalAttempts = 0;
        getCloserToTargetDice(targetDice);
    })

    jQuery('#grid').on('contextmenu', '.cell', function(event) {
        jQuery(this).toggleClass('detected');
        event.preventDefault();
        // recompute the dice coefficient
        computeDice();
        return false;
    });

    jQuery('#switchDrawMode').on('change', function() {
        if (jQuery(this).is(':checked')) {
            jQuery('#draw-mode-label').text('Draw detected (AI) mask');
        } else {
            jQuery('#draw-mode-label').text('Draw human mask');
        }
    });
})