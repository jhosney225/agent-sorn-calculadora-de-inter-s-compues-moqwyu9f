
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Tool definitions for compound interest calculator
const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calcula el interés compuesto de una inversión. Retorna el monto final, interés ganado y análisis detallado.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Capital inicial invertido en moneda base",
        },
        annual_rate: {
          type: "number",
          description: "Tasa de interés anual como porcentaje (ej: 5 para 5%)",
        },
        time_years: {
          type: "number",
          description: "Período de inversión en años",
        },
        compounds_per_year: {
          type: "number",
          description:
            "Número de veces que se compone el interés por año (1=anual, 2=semestral, 4=trimestral, 12=mensual, 365=diario)",
          enum: [1, 2, 4, 12, 365],
        },
      },
      required: ["principal", "annual_rate", "time_years", "compounds_per_year"],
    },
  },
  {
    name: "calculate_investment_scenarios",
    description:
      "Calcula y compara múltiples escenarios de inversión con diferentes parámetros.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Capital inicial",
        },
        annual_rate: {
          type: "number",
          description: "Tasa de interés anual como porcentaje",
        },
        time_years: {
          type: "number",
          description: "Período de inversión en años",
        },
        additional_monthly_contribution: {
          type: "number",
          description: "Contribución mensual adicional (0 si no hay)",
        },
      },
      required: [
        "principal",
        "annual_rate",
        "time_years",
        "additional_monthly_contribution",
      ],
    },
  },
  {
    name: "calculate_required_time",
    description:
      "Calcula el tiempo necesario para alcanzar un monto objetivo de inversión.",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Capital inicial",
        },
        target_amount: {
          type: "number",
          description: "Monto objetivo a alcanzar",
        },
        annual_rate: {
          type: "number",
          description: "Tasa de interés anual como porcentaje",
        },
        compounds_per_year: {
          type: "number",
          description: "Número de veces que se compone el interés por año",
          enum: [1, 2, 4, 12, 365],
        },
      },
      required: [
        "principal",
        "target_amount",
        "annual_rate",
        "compounds_per_year",
      ],
    },
  },
];

// Tool implementation functions
function calculateCompoundInterest(
  principal,
  annualRate,
  timeYears,
  compoundsPerYear
) {
  const rate = annualRate / 100;
  const amount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * timeYears);
  const interestEarned = amount - principal;

  const yearlyBreakdown = [];
  for (let year = 1; year <= timeYears; year++) {
    const yearAmount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * year);
    yearlyBreakdown.push({
      year,
      amount: parseFloat(yearAmount.toFixed(2)),
      interestEarned: parseFloat((yearAmount - principal).toFixed(2)),
    });
  }

  return {
    principal: parseFloat(principal.toFixed(2)),
    annual_rate: annualRate,
    time_years: timeYears,
    compounds_per_year: compoundsPerYear,
    final_amount: parseFloat(amount.toFixed(2)),
    total_interest_earned: parseFloat(interestEarned.toFixed(2)),
    effective_annual_rate: parseFloat(
      ((Math.pow(1 + rate / compoundsPerYear, compoundsPerYear) - 1) * 100).toFixed(2)
    ),
    yearly_breakdown: yearlyBreakdown,
  };
}

function calculateInvestmentScenarios(principal, annualRate, timeYears, additionalMonthlyContribution) {
  const rate = annualRate / 100;
  const monthlyRate = rate / 12;
  const numberOfMonths = timeYears * 12;

  // Scenario 1: Sin contribuciones adicionales, compuesto mensualmente
  let amount1 = principal * Math.pow(1 + monthlyRate, numberOfMonths);

  // Scenario 2: Con contribuciones adicionales mensuales
  let amount2 = principal * Math.pow(1 + monthlyRate, numberOfMonths);
  if (additionalMonthlyContribution > 0) {
    amount2 +=
      additionalMonthlyContribution *
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1) /
      monthlyRate;
  }

  // Scenario 3: Compuesto diariamente sin contribuciones
  const dailyRate = rate / 365;
  const numberOfDays = timeYears * 365;
  let amount3 = principal * Math.pow(1 + dailyRate, numberOfDays);

  return {
    