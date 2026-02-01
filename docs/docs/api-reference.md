# API Reference

The full API specification is available below.

<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
<style>
  .swagger-ui .topbar { display: none; }
  .md-typeset h1, .md-content__button { display: none; }
</style>

<div id="swagger-ui"></div>

<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    SwaggerUIBundle({
      url: 'https://raw.githubusercontent.com/letrome/taskflow-backend/main/openapi.json',
      dom_id: '#swagger-ui',
    });
  };
</script>
