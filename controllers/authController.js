const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Inscription d'un utilisateur
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de l’inscription' });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Email reçu:", email);
    console.log("Mot de passe reçu:", password);

    const user = await User.findOne({ email });
    console.log("Utilisateur trouvé:", user);

    if (!user) {
      console.log("Utilisateur non trouvé");
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Mot de passe correct:", passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token généré:", token);

    res.json({ token });
  } catch (err) {
    console.error("Erreur lors de la connexion:", err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// Obtenir les informations de l'utilisateur
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
};
