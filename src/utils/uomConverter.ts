// Comprehensive Unit of Measure (UoM) Conversion Engine for HVAC / MEP Contracting & Master Inventory
// Supports Thermal Capacity, Airflow, Length, Area, Mass/Weight, Liquid Volume, Pressure, Packaging & Unit Rates

export type UomCategory =
  | 'capacity'
  | 'airflow'
  | 'length'
  | 'area'
  | 'weight'
  | 'volume'
  | 'pressure'
  | 'packaging';

export interface UomUnit {
  id: string;
  name: string;
  symbol: string;
  factorToBase: number; // Multiplier to convert to base unit
  description: string;
  aliases: string[];
}

export interface UomCategoryDefinition {
  id: UomCategory;
  name: string;
  baseUnitId: string;
  description: string;
  units: UomUnit[];
}

export const UOM_CATEGORIES: Record<UomCategory, UomCategoryDefinition> = {
  capacity: {
    id: 'capacity',
    name: 'HVAC Cooling & Thermal Capacity',
    baseUnitId: 'kw',
    description: 'Chillers, VRF/VRV, Packaged Units, Fan Coil & DX Evaporators',
    units: [
      {
        id: 'tr',
        name: 'Tons of Refrigeration',
        symbol: 'TR',
        factorToBase: 3.51685284,
        description: 'Standard HVAC industrial cooling rating (1 TR = 12,000 BTU/hr)',
        aliases: ['tr', 'ton', 'tons', 'rt', 'refrigeration ton']
      },
      {
        id: 'btuh',
        name: 'BTU per Hour',
        symbol: 'BTU/hr',
        factorToBase: 0.000293071,
        description: 'Imperial thermal output (12,000 BTU/hr = 1 TR)',
        aliases: ['btu', 'btu/hr', 'btuh', 'btus']
      },
      {
        id: 'kw',
        name: 'Kilowatt Thermal',
        symbol: 'kW',
        factorToBase: 1.0,
        description: 'SI thermal and electrical capacity standard',
        aliases: ['kw', 'kilowatt', 'kilowatts']
      },
      {
        id: 'kcalh',
        name: 'Kilocalories per Hour',
        symbol: 'kcal/h',
        factorToBase: 0.001163,
        description: 'Metric heat exchange standard (3,024 kcal/h = 1 TR)',
        aliases: ['kcal', 'kcal/h', 'kcal/hr', 'kilocalories']
      },
      {
        id: 'hp',
        name: 'Boiler / Mechanical HP',
        symbol: 'HP',
        factorToBase: 0.7457,
        description: 'Motor and compressor equivalent horsepower',
        aliases: ['hp', 'horsepower']
      }
    ]
  },

  airflow: {
    id: 'airflow',
    name: 'Airflow & Ventilation Volume',
    baseUnitId: 'cfm',
    description: 'AHUs, Inline Fans, Axial Fans, Ecology Units, Diffusers & Grilles',
    units: [
      {
        id: 'cfm',
        name: 'Cubic Feet per Minute',
        symbol: 'CFM',
        factorToBase: 1.0,
        description: 'Standard HVAC airflow velocity rating',
        aliases: ['cfm', 'cubic feet per minute', 'ft3/min']
      },
      {
        id: 'cmh',
        name: 'Cubic Meters per Hour',
        symbol: 'CMH (m³/h)',
        factorToBase: 0.588578,
        description: 'European & Indian metric ventilation standard (1 CFM ≈ 1.7 CMH)',
        aliases: ['cmh', 'm3/h', 'm³/h', 'cubic meter per hour']
      },
      {
        id: 'ls',
        name: 'Liters per Second',
        symbol: 'L/s',
        factorToBase: 2.11888,
        description: 'Metric compact ventilation unit (1 L/s ≈ 2.12 CFM)',
        aliases: ['l/s', 'ls', 'liters per second']
      },
      {
        id: 'm3s',
        name: 'Cubic Meters per Second',
        symbol: 'm³/s',
        factorToBase: 2118.88,
        description: 'High capacity tunnel & mine ventilation flow',
        aliases: ['m3/s', 'm³/s']
      }
    ]
  },

  length: {
    id: 'length',
    name: 'Length, Piping & Duct Runs',
    baseUnitId: 'm',
    description: 'Copper Tubing, MS/GI Pipes, Cable Trays, Flexible Ducts & RMT',
    units: [
      {
        id: 'm',
        name: 'Meter',
        symbol: 'm',
        factorToBase: 1.0,
        description: 'Standard SI metric length',
        aliases: ['m', 'meter', 'meters', 'mtr', 'mtrs']
      },
      {
        id: 'rmt',
        name: 'Running Meter',
        symbol: 'RMT',
        factorToBase: 1.0,
        description: 'Standard contracting measure for linear pipe & duct installation',
        aliases: ['rmt', 'running meter', 'rm']
      },
      {
        id: 'mm',
        name: 'Millimeter',
        symbol: 'mm',
        factorToBase: 0.001,
        description: 'Pipe wall thickness, diameters and sheet gauges (1 m = 1,000 mm)',
        aliases: ['mm', 'millimeter', 'millimeters']
      },
      {
        id: 'cm',
        name: 'Centimeter',
        symbol: 'cm',
        factorToBase: 0.01,
        description: 'Metric centimeter (1 m = 100 cm)',
        aliases: ['cm', 'centimeter', 'centimeters']
      },
      {
        id: 'ft',
        name: 'Feet / Foot',
        symbol: 'ft',
        factorToBase: 0.3048,
        description: 'Imperial pipe lengths & room dimensions (1 m ≈ 3.2808 ft)',
        aliases: ['ft', 'feet', 'foot', "'"]
      },
      {
        id: 'in',
        name: 'Inch',
        symbol: 'in',
        factorToBase: 0.0254,
        description: 'Pipe diameters & sheet gauge dimensions (1 ft = 12 in)',
        aliases: ['in', 'inch', 'inches', '"']
      },
      {
        id: 'yd',
        name: 'Yard',
        symbol: 'yd',
        factorToBase: 0.9144,
        description: 'Imperial linear yard (1 yd = 3 ft)',
        aliases: ['yd', 'yard', 'yards']
      }
    ]
  },

  area: {
    id: 'area',
    name: 'Surface Area & Insulation',
    baseUnitId: 'sqm',
    description: 'GI Duct Fabrication Sheets, Acoustic Lining, Nitrile Rubber Foam',
    units: [
      {
        id: 'sqm',
        name: 'Square Meter',
        symbol: 'sq.m (m²)',
        factorToBase: 1.0,
        description: 'Standard BOQ surface area unit for ducting and panelling',
        aliases: ['sqm', 'sq.m', 'm2', 'm²', 'square meter', 'square meters']
      },
      {
        id: 'sqft',
        name: 'Square Feet',
        symbol: 'sq.ft (ft²)',
        factorToBase: 0.092903,
        description: 'Imperial floor and sheet measure (1 sq.m ≈ 10.7639 sq.ft)',
        aliases: ['sqft', 'sq.ft', 'ft2', 'ft²', 'square feet', 'sft']
      },
      {
        id: 'sqin',
        name: 'Square Inch',
        symbol: 'sq.in',
        factorToBase: 0.00064516,
        description: 'Grille free area, damper neck & duct cross section',
        aliases: ['sqin', 'sq.in', 'in2', 'in²']
      },
      {
        id: 'sqmm',
        name: 'Square Millimeter',
        symbol: 'sq.mm',
        factorToBase: 0.000001,
        description: 'Cable conductor cross sections (e.g. 4 sq.mm wire)',
        aliases: ['sqmm', 'sq.mm', 'mm2', 'mm²']
      }
    ]
  },

  weight: {
    id: 'weight',
    name: 'Mass & Material Weight',
    baseUnitId: 'kg',
    description: 'Refrigerant Gases, Copper Tubing, Structural Steel & Fasteners',
    units: [
      {
        id: 'kg',
        name: 'Kilogram',
        symbol: 'kg',
        factorToBase: 1.0,
        description: 'Standard SI mass for freon cylinders, copper weight & sheet metal',
        aliases: ['kg', 'kgs', 'kilogram', 'kilograms']
      },
      {
        id: 'g',
        name: 'Gram',
        symbol: 'g',
        factorToBase: 0.001,
        description: 'Trace chemicals, adhesives and small fittings',
        aliases: ['g', 'gram', 'grams', 'gm']
      },
      {
        id: 'mt',
        name: 'Metric Tonne',
        symbol: 'MT / t',
        factorToBase: 1000.0,
        description: 'Bulk structural steel, chillers and heavy machinery (1 MT = 1,000 kg)',
        aliases: ['mt', 'tonne', 'tonnes', 'metric ton', 't']
      },
      {
        id: 'lb',
        name: 'Pound',
        symbol: 'lb',
        factorToBase: 0.45359237,
        description: 'Imperial freon cylinders & pipe weight (1 kg ≈ 2.20462 lb)',
        aliases: ['lb', 'lbs', 'pound', 'pounds']
      },
      {
        id: 'oz',
        name: 'Ounce',
        symbol: 'oz',
        factorToBase: 0.0283495,
        description: 'Imperial fluid ounce mass (1 lb = 16 oz)',
        aliases: ['oz', 'ounce', 'ounces']
      }
    ]
  },

  volume: {
    id: 'volume',
    name: 'Liquid & Fluid Volume',
    baseUnitId: 'l',
    description: 'Refrigerant Compressor Oils, Glycol, Hydronic Chilled Water & Sealants',
    units: [
      {
        id: 'l',
        name: 'Liter',
        symbol: 'L',
        factorToBase: 1.0,
        description: 'Standard metric liquid volume',
        aliases: ['l', 'liter', 'liters', 'ltr', 'ltrs']
      },
      {
        id: 'ml',
        name: 'Milliliter',
        symbol: 'mL',
        factorToBase: 0.001,
        description: 'Thread sealants, compressor lubricant additives & chemicals',
        aliases: ['ml', 'milliliter', 'milliliters']
      },
      {
        id: 'm3',
        name: 'Cubic Meter',
        symbol: 'm³ (kL)',
        factorToBase: 1000.0,
        description: 'Cooling tower basin volume & thermal storage tanks (1 m³ = 1,000 L)',
        aliases: ['m3', 'm³', 'cubic meter', 'kl']
      },
      {
        id: 'cuft',
        name: 'Cubic Feet',
        symbol: 'cu.ft (ft³)',
        factorToBase: 28.3168,
        description: 'Imperial tank & chamber capacity (1 cu.ft ≈ 28.32 L)',
        aliases: ['cuft', 'cu.ft', 'ft3', 'cft']
      },
      {
        id: 'gal_us',
        name: 'US Gallon',
        symbol: 'US gal',
        factorToBase: 3.78541,
        description: 'American standard fluid volume (1 US gal ≈ 3.785 L)',
        aliases: ['gal', 'gallon', 'gallons', 'us gal']
      },
      {
        id: 'gal_imp',
        name: 'Imperial Gallon',
        symbol: 'Imp gal',
        factorToBase: 4.54609,
        description: 'Commonwealth standard volume (1 Imp gal ≈ 4.546 L)',
        aliases: ['imp gal', 'imperial gallon']
      }
    ]
  },

  pressure: {
    id: 'pressure',
    name: 'Hydronic & Refrigerant Pressure',
    baseUnitId: 'bar',
    description: 'Suction/Discharge Gauges, Chilled Water Pump Head & Duct Static',
    units: [
      {
        id: 'bar',
        name: 'Bar',
        symbol: 'bar',
        factorToBase: 1.0,
        description: 'Metric HVAC pressure rating (1 bar = 100 kPa ≈ 14.504 PSI)',
        aliases: ['bar', 'bars']
      },
      {
        id: 'psi',
        name: 'Pounds per Square Inch',
        symbol: 'PSI',
        factorToBase: 0.0689476,
        description: 'Standard refrigerant pressure gauge reading (1 bar ≈ 14.5038 PSI)',
        aliases: ['psi', 'psig', 'psia', 'lbf/in2']
      },
      {
        id: 'pa',
        name: 'Pascal',
        symbol: 'Pa',
        factorToBase: 0.00001,
        description: 'SI pressure standard, cleanroom positive pressure & filter drop',
        aliases: ['pa', 'pascal']
      },
      {
        id: 'kpa',
        name: 'Kilopascal',
        symbol: 'kPa',
        factorToBase: 0.01,
        description: 'SI piping pressure (100 kPa = 1 bar)',
        aliases: ['kpa', 'kilopascal']
      },
      {
        id: 'mmwc',
        name: 'mm of Water Column',
        symbol: 'mmWC',
        factorToBase: 0.0000980665,
        description: 'Fan external static pressure (ESP) & filter resistance',
        aliases: ['mmwc', 'mmh2o', 'mm of water']
      },
      {
        id: 'inwg',
        name: 'Inches of Water Gauge',
        symbol: 'in.wg',
        factorToBase: 0.00249089,
        description: 'Imperial duct static pressure rating (1 in.wg = 25.4 mmWC ≈ 249 Pa)',
        aliases: ['inwg', 'in.wg', 'inh2o', 'in wc']
      },
      {
        id: 'atm',
        name: 'Atmosphere Standard',
        symbol: 'atm',
        factorToBase: 1.01325,
        description: 'Sea-level atmospheric baseline (1 atm = 1.01325 bar = 14.696 PSI)',
        aliases: ['atm', 'atmosphere']
      }
    ]
  },

  packaging: {
    id: 'packaging',
    name: 'Packaging, Bundles & Quantities',
    baseUnitId: 'pcs',
    description: 'Piece, Box, Roll, Packet, Bundle & Master Carton Conversions',
    units: [
      {
        id: 'pcs',
        name: 'Pieces / Numbers',
        symbol: 'PCS',
        factorToBase: 1.0,
        description: 'Single discrete unit or count',
        aliases: ['pcs', 'nos', 'unit', 'piece', 'pieces', 'each', 'no']
      },
      {
        id: 'set',
        name: 'Set',
        symbol: 'SET',
        factorToBase: 1.0,
        description: 'Matched pair or assembly set (e.g. Indoor + Outdoor unit)',
        aliases: ['set', 'sets', 'assembly']
      },
      {
        id: 'doz',
        name: 'Dozen',
        symbol: 'DOZ',
        factorToBase: 12.0,
        description: 'Pack of 12 units',
        aliases: ['doz', 'dozen']
      },
      {
        id: 'box',
        name: 'Box / Carton',
        symbol: 'BOX',
        factorToBase: 50.0, // Configurable via custom multiplier in calculator
        description: 'Packaged carton (custom piece multiplier supported)',
        aliases: ['box', 'boxes', 'carton', 'ctn']
      },
      {
        id: 'pkt',
        name: 'Packet',
        symbol: 'PKT',
        factorToBase: 10.0,
        description: 'Fastener, washer or clamp packet',
        aliases: ['pkt', 'packet', 'packets', 'pack']
      },
      {
        id: 'roll',
        name: 'Roll',
        symbol: 'ROLL',
        factorToBase: 30.0, // e.g. 30 meters per roll of insulation or tape
        description: 'Continuous roll (e.g. 30m insulation foam / tape)',
        aliases: ['roll', 'rolls']
      },
      {
        id: 'bundle',
        name: 'Bundle',
        symbol: 'BDL',
        factorToBase: 10.0, // e.g. 10 pipes per bundle
        description: 'Bundle of copper / MS pipe sections or rods',
        aliases: ['bundle', 'bundles', 'bdl']
      },
      {
        id: 'sheet',
        name: 'Sheet / Board',
        symbol: 'SHT',
        factorToBase: 1.0,
        description: 'Single sheet of GI metal or acoustic board',
        aliases: ['sheet', 'sheets', 'sht', 'board']
      },
      {
        id: 'cyl',
        name: 'Cylinder',
        symbol: 'CYL',
        factorToBase: 1.0,
        description: 'Pressurized gas cylinder (e.g. 45kg or 11.3kg R410A)',
        aliases: ['cylinder', 'cylinders', 'cyl']
      }
    ]
  }
};

/**
 * Perform exact two-way UoM conversion between units of the same category
 */
export function convertUomValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UomCategory,
  customPackagingFactor?: number
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  const cat = UOM_CATEGORIES[category];
  if (!cat) return value;

  const fromUnit = cat.units.find((u) => u.id === fromUnitId);
  const toUnit = cat.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  // Compute effective factor to base
  let fromFactor = fromUnit.factorToBase;
  let toFactor = toUnit.factorToBase;

  // If user provided a custom multiplier for packaging units like Box or Bundle
  if (category === 'packaging' && customPackagingFactor && customPackagingFactor > 0) {
    if (fromUnitId === 'box' || fromUnitId === 'bundle' || fromUnitId === 'roll' || fromUnitId === 'pkt') {
      fromFactor = customPackagingFactor;
    }
    if (toUnitId === 'box' || toUnitId === 'bundle' || toUnitId === 'roll' || toUnitId === 'pkt') {
      toFactor = customPackagingFactor;
    }
  }

  // Convert to Base, then from Base to Target
  const baseValue = value * fromFactor;
  const targetValue = baseValue / toFactor;

  return targetValue;
}

/**
 * Convert unit monetary rate (e.g. ₹ per Meter -> ₹ per Foot).
 * Rates invert because: Total Cost = Quantity * Rate.
 * If 1 Meter = 3.28084 Feet, then Rate per Foot = Rate per Meter / 3.28084.
 */
export function convertUnitRate(
  baseRate: number,
  fromUnitId: string,
  toUnitId: string,
  category: UomCategory,
  customPackagingFactor?: number
): number {
  if (isNaN(baseRate) || baseRate <= 0) return 0;
  if (fromUnitId === toUnitId) return baseRate;

  // 1 unit of fromUnit converted into toUnit
  const unitsInTarget = convertUomValue(1, fromUnitId, toUnitId, category, customPackagingFactor);
  if (unitsInTarget <= 0) return baseRate;

  // Rate in target unit is baseRate divided by how many target units make 1 source unit
  return baseRate / unitsInTarget;
}

/**
 * Detect category and unit ID from string (e.g. from InventoryItem.unit)
 */
export function detectUomCategory(unitStr: string): { category: UomCategory; unitId: string } | null {
  if (!unitStr) return null;
  const normalized = unitStr.trim().toLowerCase().replace(/[^a-z0-9/³²°]/g, '');

  for (const [catKey, catDef] of Object.entries(UOM_CATEGORIES)) {
    for (const u of catDef.units) {
      if (u.id === normalized || u.symbol.toLowerCase() === normalized) {
        return { category: catKey as UomCategory, unitId: u.id };
      }
      for (const alias of u.aliases) {
        const cleanAlias = alias.replace(/[^a-z0-9/³²°]/g, '');
        if (cleanAlias === normalized || normalized.includes(cleanAlias)) {
          return { category: catKey as UomCategory, unitId: u.id };
        }
      }
    }
  }

  // Common HVAC item unit fallbacks
  if (normalized.includes('meter') || normalized.includes('mtr') || normalized.includes('rmt')) {
    return { category: 'length', unitId: 'm' };
  }
  if (normalized.includes('ton') || normalized.includes('tr')) {
    return { category: 'capacity', unitId: 'tr' };
  }
  if (normalized.includes('kg') || normalized.includes('kilo')) {
    return { category: 'weight', unitId: 'kg' };
  }
  if (normalized.includes('sheet') || normalized.includes('sqm') || normalized.includes('m2')) {
    return { category: 'area', unitId: 'sqm' };
  }
  if (normalized.includes('cfm') || normalized.includes('cmh')) {
    return { category: 'airflow', unitId: 'cfm' };
  }
  if (normalized.includes('box') || normalized.includes('carton')) {
    return { category: 'packaging', unitId: 'box' };
  }
  if (normalized.includes('nos') || normalized.includes('pcs') || normalized.includes('unit')) {
    return { category: 'packaging', unitId: 'pcs' };
  }

  return { category: 'packaging', unitId: 'pcs' };
}

/**
 * Generate full conversion matrix table for a given quantity
 */
export function getUnitMatrix(
  value: number,
  fromUnitId: string,
  category: UomCategory,
  customPackagingFactor?: number
): Array<{
  unit: UomUnit;
  convertedValue: number;
  formatted: string;
  isSource: boolean;
}> {
  const cat = UOM_CATEGORIES[category];
  if (!cat) return [];

  return cat.units.map((unit) => {
    const isSource = unit.id === fromUnitId;
    const converted = convertUomValue(value, fromUnitId, unit.id, category, customPackagingFactor);

    let formatted: string;
    if (Math.abs(converted) >= 1000) {
      formatted = converted.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    } else if (Math.abs(converted) >= 1) {
      formatted = converted.toFixed(3).replace(/\.?0+$/, '');
    } else if (converted === 0) {
      formatted = '0';
    } else {
      formatted = converted.toFixed(4).replace(/\.?0+$/, '');
    }

    return {
      unit,
      convertedValue: converted,
      formatted: `${formatted} ${unit.symbol}`,
      isSource
    };
  });
}
