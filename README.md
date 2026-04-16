# 🌮 Mexitán — Menú Público

Página web pública del menú de **Mexitán Food & Drink**, disponible en:

> **[mexitan-foodanddrink.github.io](https://mexitan-foodanddrink.github.io/)**

El menú se carga en tiempo real desde la base de datos del sistema POS, por lo que cualquier cambio de precio o producto se refleja automáticamente sin tocar este repositorio.

---

## Estructura del proyecto

```
├── index.html   # Estructura HTML de la página
├── style.css    # Estilos y diseño visual
├── menu.js      # Conexión a Firebase y renderizado del menú
├── logo.png     # Logo del restaurante
└── README.md
```

---

## Cómo funciona

```
Sistema POS (mexitan-pos)
        │
        │  Guarda cambios en
        ▼
  Firebase Firestore
  └── config/menu
      └── categorias: [ { cat, items: [{n, p}] } ]
        │
        │  Al cargar la página
        ▼
  GitHub Pages (este repo)
  └── menu.js lee Firestore y genera el HTML del menú
```

1. El operador modifica precios o productos desde el **sistema POS**.
2. Los cambios se guardan en **Firestore** (`config/menu`).
3. Al abrir la página pública, `menu.js` consulta Firestore y renderiza el menú actualizado.

No se requiere tocar este repositorio para actualizar el menú.

---

## Secciones del menú

| Sección | Categorías en Firestore |
|---|---|
| Comida | Comida · Chilaquiles · Huevo al Gusto · Sandwiches |
| Antojitos y Más | Antojitos · Burritos · Molletes · Quesocarne · Hot Dogs / Boneless · Crepas / Waffles · Banderillas |
| Burgers | Burgers |
| Menú de Pakistán | Pakistán — Chai · Pakistán — Snacks · Cold Drink |
| Bebidas | Bebidas Calientes · Herbal Tea / Tés · Bebidas Frías |

Si se agrega una categoría nueva en el POS que no esté en esta tabla, aparecerá automáticamente en una sección **"Otros"** al final del menú.

---

## Requisitos de Firebase

Para que la página pública pueda leer el menú, las **reglas de Firestore** deben permitir lectura pública del documento `config/menu`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Menú público (solo lectura, sin autenticación)
    match /config/menu {
      allow read: if true;
    }

    // Todo lo demás requiere autenticación
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Estas reglas se configuran en la consola de Firebase:
**Firebase Console → mexitan-pos → Firestore → Rules**

---

## Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (lectura pública, sin autenticación)
- [Google Fonts](https://fonts.google.com/) — Barlow, Barlow Condensed, Pacifico
- Alojado en [GitHub Pages](https://pages.github.com/)

---

## Proyecto relacionado

El sistema POS que administra el menú es un proyecto privado separado (`mexitan-pos`) desplegado en Firebase Hosting.
