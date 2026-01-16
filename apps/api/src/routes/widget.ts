import { Router, Request, Response } from 'express';

const router = Router();

// Serve embed snippet HTML
router.get('/embed-snippet', (_req: Request, res: Response) => {
  const snippet = `
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.WIDGET_URL || 'http://localhost:5173'}/widget.js';
    script.setAttribute('data-zeev-context', '{{CONTEXT}}');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-position', 'bottom-right');
    script.setAttribute('data-title', 'Chat de Atendimento');
    document.head.appendChild(script);
  })();
</script>
  `.trim();
  
  res.setHeader('Content-Type', 'text/html');
  res.send(`<pre>${snippet}</pre>`);
});

export default router;
