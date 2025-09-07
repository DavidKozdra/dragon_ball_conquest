
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(list) {
  return list[randomInt(0, list.length - 1)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// --------------------------------------------------
// Genome (individual solution) utilities
// --------------------------------------------------

/**
 * Generate a random genome (solution vector)
 */
function createRandomGenome(paramDefs) {
  let params = paramDefs.map(param => {
    switch (param.type) {
      case "continuous": return randomFloat(param.min, param.max);
      case "integer":    return randomInt(param.min, param.max);
      case "categorical":return randomChoice(param.options);
      default: throw new Error("Unknown parameter type: " + param.type);
    }
  });

  
  return params
}

/**
 * Convert genome array into {paramName: value}
 */
function decodeGenome(genome, paramDefs) {
  const decoded = {};
  for (let i = 0; i < paramDefs.length; i++) {
    decoded[paramDefs[i].name] = genome[i];
  }
  return decoded;
}

// --------------------------------------------------
// Selection, Crossover, Mutation
// --------------------------------------------------

/**
 * Tournament selection: pick the fittest among random candidates
 */
function selectParent(population, fitnesses, tournamentSize = 3) {
  let bestIndex = null;
  for (let i = 0; i < tournamentSize; i++) {
    const candidateIndex = randomInt(0, population.length - 1);
    if (bestIndex === null || fitnesses[candidateIndex] > fitnesses[bestIndex]) {
      bestIndex = candidateIndex;
    }
  }
  return [...population[bestIndex]]; // clone genome
}

/**
 * Uniform crossover: mix parent genes to create child
 */
function crossover(parentA, parentB, paramDefs) {
  return parentA.map((geneA, i) => {
    const geneB = parentB[i];
    const param = paramDefs[i];

    // 50% chance to mix, otherwise keep geneA
    if (Math.random() < 0.5) {
      if (param.type === "continuous" || param.type === "integer") {
        // Blend values
        const alpha = Math.random();
        let mixedValue = geneA * alpha + geneB * (1 - alpha);
        if (param.type === "integer") mixedValue = Math.round(mixedValue);
        return clamp(mixedValue, param.min, param.max);
      } else {
        // Categorical → pick from parents
        return Math.random() < 0.5 ? geneA : geneB;
      }
    } else {
      return geneA;
    }
  });
}

/**
 * Mutation: introduce small random changes
 */
function mutate(genome, paramDefs, mutationRate = 0.1, mutationStrength = 0.1) {
  return genome.map((gene, i) => {
    if (Math.random() > mutationRate) return gene;

    const param = paramDefs[i];

    if (param.type === "continuous") {
      const range = param.max - param.min;
      const noise = randomFloat(-1, 1) * range * mutationStrength;
      return clamp(gene + noise, param.min, param.max);
    }

    if (param.type === "integer") {
      const range = param.max - param.min;
      const noise = Math.round(randomFloat(-1, 1) * range * mutationStrength);
      return clamp(gene + noise, param.min, param.max);
    }

    if (param.type === "categorical") {
      let newValue;
      do { newValue = randomChoice(param.options); }
      while (newValue === gene && param.options.length > 1);
      return newValue;
    }

    return gene;
  });
}

// --------------------------------------------------
// Main GA
// --------------------------------------------------

function runGeneticAlgorithm({
  paramDefs,
  fitnessFunction,
  populationSize = 50,
  generations = 100,
  mutationRate = 0.1,
  mutationStrength = 0.1,
  elitism = 1,
  tournamentSize = 3,
  verbose = false
}) {

  console.log("params", paramDefs)
  // 1. Initialize random population
  let population = Array.from({ length: populationSize },
    () => createRandomGenome(paramDefs)); // l:list = [ createRandomGenome(param_defs) for i in range(0, populationSize) ]

  let bestGenome = null;
  let bestFitness = -Infinity;

  // 2. Evolution loop
  for (let gen = 0; gen < generations; gen++) {
    // Evaluate all genomes
    const fitnesses = population.map(genome =>
      fitnessFunction(decodeGenome(genome, paramDefs))); // (Run Simulation and get fitness function value)

    // Track best (Strange location for this :|)
    for (let i = 0; i < population.length; i++) {
      if (fitnesses[i] > bestFitness) {
        bestFitness = fitnesses[i];
        bestGenome = [...population[i]];
      }
    }

    if (verbose) {
      const avgFitness = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;
      console.log(`Generation ${gen}: Best = ${bestFitness.toFixed(4)}, Avg = ${avgFitness.toFixed(4)}`);
    }

    // Sort population by fitness (best first)
    const sortedIndices = fitnesses
      .map((fitness, index) => [fitness, index]) 
      .sort((a, b) => b[0] - a[0])
      .map(pair => pair[1]);

    // Create next generation
    const newPopulation = [];

    // 3. Elitism: copy top N individuals to new Population
    for (let i = 0; i < elitism; i++) {
      newPopulation.push([...population[sortedIndices[i]]]);
    }

    // 4. Fill rest of population with children
    while (newPopulation.length < populationSize) {
      const parentA = selectParent(population, fitnesses, tournamentSize);
      const parentB = selectParent(population, fitnesses, tournamentSize);
      let child = crossover(parentA, parentB, paramDefs);
      child = mutate(child, paramDefs, mutationRate, mutationStrength);
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return {
    bestGenome: decodeGenome(bestGenome, paramDefs),
    bestFitness,
    population
  };
}

const params = [
  { name: "x", type: "continuous", min: -5, max: 5 },
  { name: "y", type: "continuous", min: -5, max: 5 }
];

function fitness({ x, y }) {
  return -(x*x + y*y); // maximize (best is at x=0, y=0)
}

/*
const result = runGeneticAlgorithm({
  paramDefs: params,
  fitnessFunction: fitness,
  populationSize: 60,
  generations: 100,
  verbose: true
});

console.log("Best solution:", result.bestGenome, "Fitness:", result.bestFitness);
*/
function generatePairs(subjects) {
  const pairs = [];
  const N = subjects.length;

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      pairs.push([subjects[i], subjects[j]]);
    }
  }
  // console.log("Pairs: ", pairs);
  return pairs;
}

function generatePairsInBatches(subjects, batchSize) {
  const allPairs = generatePairs(subjects);
  const batches = [];

  for (let i = 0; i < allPairs.length; i += batchSize) {
    // console.log("allpairs: ", allPairs.slice(i, i + batchSize));
    batches.push(allPairs.slice(i, i + batchSize));
  }
  // console.log("Batches??? ", batches.length)
  return batches;
}

export {runGeneticAlgorithm,createRandomGenome, generatePairsInBatches}