{
  init: function(elevators, floors) {
    // Higher threshold for less moves
    // Lower threshold for less waiting time
    var threshold = 0.2;

    var queue = [];

    function removeFromQueue(floors) {
      queue = queue.filter(function(floor) {
        return (floors.indexOf(floor) === -1);
      });
    }

    function sortArray(array, descending) {
      array.sort(function(a, b) {
        if (descending) {
          return b - a;
        }
        return a - b;
      });
    }

    // Elevators
    for (var eI = 0, eL = elevators.length; eI < eL; eI++) {
      var elevator = elevators[eI];

      elevator.on('idle', function() {
        var currentFloor = this.currentFloor();
        var loadFactor = this.loadFactor();

        if (currentFloor === 0) {
          if ((loadFactor + (queue.length * 0.15)) > threshold) {
            this.destinationQueue = this.getPressedFloors();

            for (var i = 0, l = queue.length; i < l; i++) {
              if (loadFactor < 0.6) {
                this.destinationQueue.push(queue[i]);
                loadFactor += 0.15;
              } else {
                break;
              }
            }

            removeFromQueue(this.destinationQueue);

            sortArray(this.destinationQueue, false);
          }
        } else {
          this.destinationQueue = [0];

          for (var i = 0, l = queue.length; i < l; i++) {
            if ((loadFactor < 0.6)) {
              if (queue[i] < currentFloor) {
                this.destinationQueue.push(queue[i]);
                loadFactor += 0.15;
              }
            } else {
              break;
            }
          }

          removeFromQueue(this.destinationQueue);

          sortArray(this.destinationQueue, true);
        }

        this.checkDestinationQueue();
      });
    }

    // Floors
    for (var floorLevel = 0, fL = floors.length; floorLevel < fL; floorLevel++) {
      var floor = floors[floorLevel];

      floor.on('up_button_pressed', function() {
        if (this.level > 0) {
          queue.push(this.level);
        }
      });

      floor.on('down_button_pressed', function() {
        queue.push(this.level);
      });
    }
  },
  update: function(dt, elevators, floors) {}
}