async function fetchOneSlug() {
  try {
    const res = await fetch('http://localhost:3000/api/products');
    const products = await res.json();
    if (products && products.length > 0) {
      console.log(products[0].slug);
    } else {
      console.log('No products found');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
fetchOneSlug();
