interface lastIndexReserveType {
    index: number;
    value: number;
    timeAllocated: number;
  }
  
  class Intersect {
    readonly cars_throughput_rate: number; // rate of cars passing by
    lastIndexReserve: lastIndexReserveType;
    numberOfIntersections: number;
    intersects: Array<Array<number>> = [];
    totalSumOfCars: Array<number> = []; // used to make decisions
  
    constructor(numberOfIntersections: number, cars_throughput_rate: number) {
      console.log(`Creating intersection with ${numberOfIntersections} roads and throughput of ${cars_throughput_rate} cars/second`);
      this.lastIndexReserve = { index: 0, value: 0, timeAllocated: 0 };
      this.cars_throughput_rate = cars_throughput_rate;
      this.numberOfIntersections = numberOfIntersections;
  
      // Fill the arrays in
      this.fillArrayOfIntersects();
      
      // Initialize totalSumOfCars array with zeros
      this.totalSumOfCars = new Array(numberOfIntersections).fill(0);
      console.log(`Initialized totalSumOfCars: ${JSON.stringify(this.totalSumOfCars)}`);
    }
  
    fillArrayOfIntersects(n: number = this.numberOfIntersections) {
      console.log(`Filling intersect arrays for ${n} roads`);
      for (let x = 0; x < n; x++) {
        const newRoad: Array<number> = new Array();
        this.intersects.push(newRoad);
      }
      console.log(`Intersect arrays initialized: ${JSON.stringify(this.intersects)}`);
    }
  
    addNewCars(newCarsPerSecond: Array<number>) {
      console.log(`Adding new cars: ${JSON.stringify(newCarsPerSecond)}`);
      if (newCarsPerSecond.length !== this.numberOfIntersections) {
        console.error(`Error: Expected ${this.numberOfIntersections} values but got ${newCarsPerSecond.length}`);
        return;
      }
  
      for (let y = 0; y < this.numberOfIntersections; y++) {
        this.intersects[y].push(newCarsPerSecond[y]);
        console.log(`Road ${y} now has ${newCarsPerSecond[y]} new cars, total in queue: ${this.intersects[y]}`);
      }
    }
  
    generateCarArray(n: number = this.numberOfIntersections): Array<number> {
      function randomNumberOne2Ten(): number {
        return Math.floor(Math.random() * 10);
      }
      const numArray: Array<number> = new Array();
      for (let j = 0; j < n; j++) {
        numArray.push(randomNumberOne2Ten());
      }
      console.log(`Generated random cars: ${JSON.stringify(numArray)}`);
      return numArray;
    }
  
    decisionAlgo(
      intersects: Array<Array<number>> = this.intersects,
      lastIndexReserve: lastIndexReserveType = this.lastIndexReserve
    ): number {
      console.log(`Running decision algorithm with current state:`);
      console.log(`Intersects: ${JSON.stringify(intersects)}`);
      console.log(`Last index reserve: ${JSON.stringify(lastIndexReserve)}`);
      
      // Clone the intersects array and use it to make decisions
      // BUG: Object.assign creates a shallow copy, not deep copy of nested arrays
      const cloneOfIntersects: Array<Array<number>> = JSON.parse(JSON.stringify(intersects));
      console.log(`Clone of intersects: ${JSON.stringify(cloneOfIntersects)}`);
  
      // Reset and refill intersects
      this.intersects = [];
      this.fillArrayOfIntersects();
  
      // BUG: This code isn't actually updating totalSumOfCars, just calculating a value that's not used
      if (lastIndexReserve.value !== 0) {
        console.log(`Removing cars that have already passed through at index ${lastIndexReserve.index}`);
        console.log(`Before: totalSumOfCars[${lastIndexReserve.index}] = ${this.totalSumOfCars[lastIndexReserve.index]}`);
        
        // FIXED: This should actually update the totalSumOfCars array
        this.totalSumOfCars[lastIndexReserve.index] = Math.max(
          0,
          lastIndexReserve.value -
            this.cars_throughput_rate * lastIndexReserve.timeAllocated
        );
        
        console.log(`After: totalSumOfCars[${lastIndexReserve.index}] = ${this.totalSumOfCars[lastIndexReserve.index]}`);
      }
  
      // Get the sum of the arrays
      console.log(`Calculating total sum of cars for each road:`);
      for (let z = 0; z < cloneOfIntersects.length; z++) {
        let sum = 0;
        for (let i = 0; i < cloneOfIntersects[z].length; i++) {
          sum = sum + cloneOfIntersects[z][i];
        }
  
        this.totalSumOfCars[z] = sum;
        console.log(`Road ${z} total cars: ${sum}`);
      }
  
      // Calculate the number of seconds needed
      const roadWithMostCars = Math.max(...this.totalSumOfCars);
      console.log(`Road with most cars has ${roadWithMostCars} cars`);
  
      // BUG: The comparison operator is assignment (=) instead of equality (===)
      const indexOfRoadWithMostCars = this.totalSumOfCars.findIndex(
        (ele) => ele === roadWithMostCars
      );
      console.log(`Index of road with most cars: ${indexOfRoadWithMostCars}`);
  
      const timeNeeded = Math.min(
        30,
        Math.floor(roadWithMostCars / this.cars_throughput_rate)
      );

      // make sure time is not less than 5 seconds
      const timeAllocated = timeNeeded < 5 ? 5 : timeNeeded;

      console.log(`Time allocated for green light: ${timeAllocated} seconds`);
  
      // Set the lastIndexReserve object
      this.lastIndexReserve = {
        index: indexOfRoadWithMostCars,
        value: roadWithMostCars,
        timeAllocated: timeAllocated,
      };
      console.log(`Updated lastIndexReserve: ${JSON.stringify(this.lastIndexReserve)}`);
  
      return timeAllocated;
    }
  
    makeDecisions() {
      console.log(`Making traffic light decision...`);
      const greenLightTimeAllocated = this.decisionAlgo();
      console.log(`Road ${this.lastIndexReserve.index} gets green light for ${greenLightTimeAllocated} seconds`);
  
      setTimeout(() => {
        console.log(`Green light period ended for road ${this.lastIndexReserve.index}`);
        this.makeDecisions();
      }, greenLightTimeAllocated * 1000); // Convert seconds to milliseconds
    }
  }
  
  // Create a new intersect
  console.log(`Starting traffic simulation...`);
  const intersect1 = new Intersect(3, 2);
  
  // Start the decision-making process
  intersect1.makeDecisions();
  
  // Add cars every second
  setInterval(() => {
    console.log(`\n--- New second of traffic ---`);
    intersect1.addNewCars(intersect1.generateCarArray());
  }, 1000);