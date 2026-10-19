import express from 'express';
import mongoose from 'mongoose';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'node:url';
import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import viewsRouter from './routes/views.router.js';
import { BusinessRuleError, NotFoundError } from './utils/errors.js';

const app = express();

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

app.engine(
  'handlebars',
  engine({
    helpers: {
      formatPrice: (value) => priceFormatter.format(value),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', fileURLToPath(new URL('./views', import.meta.url)));

app.use(express.json());
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

app.get('/', (req, res) => res.redirect('/views/services'));
app.use('/views', viewsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

const describeMongooseError = (error) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return Object.values(error.errors)
      .map((item) =>
        item instanceof mongoose.Error.CastError ? `${item.path} tiene un tipo de dato inválido` : item.message
      )
      .join('; ');
  }
  return `${error.path} tiene un tipo de dato inválido`;
};

app.use((error, req, res, next) => {
  if (error instanceof BusinessRuleError) {
    return res.status(400).json({ status: 'error', error: error.message });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({ status: 'error', error: error.message });
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ status: 'error', error: describeMongooseError(error) });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', error: 'El body no es un JSON válido' });
  }
  console.error(error);
  return res.status(500).json({ status: 'error', error: 'Error interno del servidor' });
});

export default app;
