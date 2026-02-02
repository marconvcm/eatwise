const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Convert Kotlin data class to TypeScript type
 */
function convertKotlinToTypeScript(kotlinContent) {
   // Step 1: Remove everything before 'data class'
   const dataClassStart = kotlinContent.indexOf('data class');
   if (dataClassStart === -1) {
      console.error('No data class found');
      return '';
   }
   
   let content = kotlinContent.substring(dataClassStart);
   
   // Step 2: Extract class name and find the opening parenthesis
   const classNameMatch = content.match(/data\s+class\s+(\w+)\s*\(/);
   if (!classNameMatch) {
      console.error('Could not parse class name');
      return '';
   }
   
   const className = classNameMatch[1];
   const openParenIndex = content.indexOf('(');
   
   // Step 3: Find matching closing parenthesis
   let depth = 0;
   let closeParenIndex = -1;
   for (let i = openParenIndex; i < content.length; i++) {
      if (content[i] === '(') depth++;
      if (content[i] === ')') depth--;
      if (depth === 0) {
         closeParenIndex = i;
         break;
      }
   }
   
   if (closeParenIndex === -1) {
      console.error('Could not find closing parenthesis');
      return '';
   }
   
   // Step 4: Extract and clean properties
   const propertiesBlock = content.substring(openParenIndex + 1, closeParenIndex);
   const lines = propertiesBlock.split('\n');
   
   const properties = [];
   let currentProp = '';
   let currentAnnotations = [];
   
   for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Collect annotations
      if (trimmed.startsWith('@')) {
         currentAnnotations.push(trimmed);
         continue;
      }
      
      currentProp += ' ' + trimmed;
      
      // If line ends with comma, we have a complete property
      if (trimmed.endsWith(',')) {
         // Check if any annotation contains @JsonIgnore
         const hasJsonIgnore = currentAnnotations.some(ann => 
            ann.includes('@JsonIgnore') || ann.includes('@field:JsonIgnore')
         );
         
         if (!hasJsonIgnore) {
            properties.push(currentProp.trim().slice(0, -1)); // Remove trailing comma
         }
         
         currentProp = '';
         currentAnnotations = [];
      }
   }
   
   // Add last property if exists (no trailing comma)
   if (currentProp.trim()) {
      const hasJsonIgnore = currentAnnotations.some(ann => 
         ann.includes('@JsonIgnore') || ann.includes('@field:JsonIgnore')
      );
      
      if (!hasJsonIgnore) {
         properties.push(currentProp.trim());
      }
   }
   
   // Step 5: Convert each property to TypeScript
   const tsProps = properties
      .map(prop => {
         const match = prop.match(/(?:val|var)\s+(\w+)\s*:\s*([\w<>?,\s]+)(?:\s*=\s*(.+))?/);
         if (!match) return '';
         
         const [, name, type, defaultVal] = match;
         const isNullable = type.includes('?') || (defaultVal && defaultVal.trim() === 'null');
         const cleanType = type.replace(/\?/g, '').trim();
         const tsType = convertType(cleanType);
         const optional = isNullable ? '?' : '';
         
         return `  ${name}${optional}: ${tsType};`;
      })
      .filter(Boolean)
      .join('\n');
   
   const header = `/**
 * This file is auto-generated. Do not edit manually.
 * Generated from Kotlin data classes.
 */

`;
   
   return `${header}export type ${className} = {\n${tsProps}\n};`;
}

/**
 * Convert Kotlin types to TypeScript types
 */
function convertType(kotlinType) {
   const typeMap = {
      'String': 'string',
      'Int': 'number',
      'Long': 'number',
      'Double': 'number',
      'Float': 'number',
      'Boolean': 'boolean',
      'Any': 'any',
      'Unit': 'void',
      'LocalDateTime': 'string',
      'LocalDate': 'string',
      'UUID': 'string'
   };

   let type = kotlinType.trim();

   // Handle List/Array types
   if (type.startsWith('List<') || type.startsWith('MutableList<')) {
      const innerType = type.match(/<(.+)>/)?.[1] || 'any';
      return `${convertType(innerType)}[]`;
   }

   // Handle Map types
   if (type.startsWith('Map<') || type.startsWith('MutableMap<')) {
      const types = type.match(/<(.+),\s*(.+)>/);
      if (types) {
         return `Record<${convertType(types[1])}, ${convertType(types[2])}>`;
      }
   }

   return typeMap[type] || type;
}

/**
 * Process a single Kotlin file
 */
function processFile(inputFile, outputDir) {
   const kotlinContent = fs.readFileSync(inputFile, 'utf8');
   const tsContent = convertKotlinToTypeScript(kotlinContent);

   const fileName = path.basename(inputFile, '.kt') + '.ts';
   const outputPath = path.join(outputDir, fileName);

   fs.writeFileSync(outputPath, tsContent);
   console.log(`Converted: ${inputFile} -> ${outputPath}`);
}

/**
 * Main function
 */
function main() {
   const args = process.argv.slice(2);

   if (args.length < 2) {
      console.log('Usage: node convertKotlinTypes.js <input-files-or-dir> <output-dir>');
      console.log('Example: node convertKotlinTypes.js "./models/*.kt" "./types"');
      process.exit(1);
   }

   const [input, outputDir] = args;

   // Create output directory if it doesn't exist
   if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
   }

   // Handle glob patterns or single file
   const files = glob.sync(input);

   if (files.length === 0) {
      console.error('No files found matching pattern:', input);
      process.exit(1);
   }

   files.forEach(file => processFile(file, outputDir));
   console.log(`\nConverted ${files.length} file(s) successfully!`);
}

main();