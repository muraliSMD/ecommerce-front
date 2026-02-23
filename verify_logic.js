
function testComparison(mrp, price) {
  const isReflected = Number(mrp) > Number(price);
  console.log(`MRP: ${mrp} (type ${typeof mrp}), Price: ${price} (type ${typeof price}) -> Reflected: ${isReflected}`);
  return isReflected;
}

console.log("Testing numeric comparisons:");
testComparison("1000", "900"); // Expected: true
testComparison(1000, 900);     // Expected: true
testComparison("900", "1000"); // Expected: false
testComparison(900, 1000);     // Expected: false
testComparison("80", "120");   // Expected: false (previously "80" > "120" was true)

console.log("\nComparison result of '80' > '120':", "80" > "120");
console.log("Comparison result of Number('80') > Number('120'):", Number('80') > Number('120'));
