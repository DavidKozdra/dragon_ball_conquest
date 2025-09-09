
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

function runGeneticAlgorithm({
  paramDefs,
  population,
  scoresMap, // Map<index, number | number[]>
  mutationRate = 0.1,
  mutationStrength = 0.1,
  elitism = 1,
  tournamentSize = 3,
  verbose = false
}) {
  if (!Array.isArray(population) || population.length === 0) {
    throw new Error("population must be a non-empty array of genomes");
  }

  const popSize = population.length;
  console.log("RunGA Scores", scoresMap);

  // 1) Build fitness array from scoresMap.
  // scoresMap value can be a single number or an array of numbers (we average arrays).
  const fitnesses = new Array(popSize).fill(-Infinity);
  // after building `fitnesses` array
  for (const [idx, val] of scoresMap.entries()) {
    if (idx < 0 || idx >= popSize) continue;
    let f;
    if (Array.isArray(val)) {
      if (val.length === 0) { f = -Infinity; }
      else f = val.reduce((s, x) => s + x, 0) / val.length;
    } else {
      f = Number(val);
    }
    fitnesses[idx] = f;
  }
  
  const validFitnesses = fitnesses.filter(f => Number.isFinite(f));
  if (validFitnesses.length === 0) {
    throw new Error("runGeneticAlgorithm: no evaluated fitnesses provided — scoresMap must contain at least one numeric fitness for a genome index.");
  }
  // 2) Find best genome & fitness (handle case where none evaluated)
  let bestFitness = -Infinity;
  let bestIndex = -1;
  for (let i = 0; i < popSize; i++) {
    if (Number.isFinite(fitnesses[i]) && fitnesses[i] > bestFitness) {
      bestFitness = fitnesses[i];
      bestIndex = i;
    }
  }
  if (bestIndex === -1) {
    // fallback: pick the first genome if no fitnesses were provided
    bestIndex = 0;
    bestFitness = fitnesses[0] === -Infinity ? -Infinity : fitnesses[0];
  }

  // 3) Sort indices by fitness (desc) for elitism
  const sortedIndices = fitnesses
    .map((f, i) => [f, i])
    .sort((a, b) => b[0] - a[0])
    .map(pair => pair[1]);

  // 4) Build next generation population
  const newPopulation = [];

  // Add elites (clone genomes)
  for (let i = 0; i < Math.min(elitism, popSize); i++) {
    const idx = sortedIndices[i];
    if (idx === undefined || !Array.isArray(population[idx])) {
      // if something is odd, fallback to a random genome clone
      const r = Math.floor(Math.random() * popSize);
      newPopulation.push([...population[r]]);
    } else {
      newPopulation.push([...population[idx]]);
    }
  }

  // Fill the rest with children
  while (newPopulation.length < popSize) {
    const parentA = selectParent(population, fitnesses, tournamentSize);
    const parentB = selectParent(population, fitnesses, tournamentSize);

    // If selection failed (e.g., all -Infinity), fallback to random parents
    const pa = Array.isArray(parentA) ? parentA : [...population[Math.floor(Math.random() * popSize)]];
    const pb = Array.isArray(parentB) ? parentB : [...population[Math.floor(Math.random() * popSize)]];

    let child = crossover(pa, pb, paramDefs);
    child = mutate(child, paramDefs, mutationRate, mutationStrength);
    newPopulation.push(child);
  }

  // Optionally print some info
  if (verbose) {
    const validFitnesses = fitnesses.filter(f => Number.isFinite(f));
    const avgFitness = validFitnesses.length ? (validFitnesses.reduce((a,b) => a+b, 0) / validFitnesses.length) : NaN;
    console.log(`Epoch result: Best=${bestFitness}, Avg=${avgFitness}`);
  }

  // 5) return decoded best genome and new population
  const bestGenomeDecoded = decodeGenome(newPopulation[0] && bestIndex >= 0 ? newPopulation.find((g, i) => i === 0 && bestIndex === 0 ? newPopulation[0] : population[bestIndex]) || population[bestIndex] : population[bestIndex], paramDefs);
  // the above ensures decodeGenome has a genome array to decode; simpler: decode the original best genome:
  const bestGenomeArray = Array.isArray(population[bestIndex]) ? population[bestIndex] : newPopulation[0];
  return {
    bestGenome: decodeGenome(bestGenomeArray, paramDefs),
    bestFitness,
    population: newPopulation
  };
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