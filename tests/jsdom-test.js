try {
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;
    
  // Простий тест jsdom;
  const dom = new JSDOM("<!DOCTYPE html><html><body><div class="test">Hello</div></body></html>");
  const div = dom.window.document.querySelector(".test");
    
  if (div && div.textContent === "Hello") {
    console.log("✅ jsdom working correctly");
    process.exit(0);
  } else {
    console.log("❌ jsdom not working properly");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ jsdom test failed:", error.message);
  process.exit(1);
}
