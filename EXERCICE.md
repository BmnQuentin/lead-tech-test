# Exercice : audit de « Parcelles »

## Contexte

Vous rejoignez l'équipe comme lead tech. Parcelles est une appli sur laquelle des utilisateurs se connectent, dessinent un terrain sur une carte et obtiennent sa surface.

Elle est prête à partir en production sur Scalingo mais un premier essai de déploiement a échoué. On vous demande votre avis avant de la reprendre.

## Ce qu'on attend

Pendant **15 à 20 minutes** vous pouvez parcourir le dépôt et nous formuler au fur et à mesure à l'oral vos remarques. À la fin on vous propose de donner :

1. Votre diagnostic : qu'est-ce qui pose problème, et pourquoi ?
2. Vos priorités : qu'est-ce qui est urgent, qu'est-ce qui peut attendre ?
3. Votre plan : par quoi commencez-vous la première semaine ? Qu'est-ce que vous laisseriez tel quel.

On ne vous demande pas de corriger le code ni d'être exhaustif mais de hiérarchiser et d'argumenter. Les questions de bonnes pratiques et d'architecture comptent plus que le détail d'une ligne. Par ailleurs vous serez (bien entendu) amené si vous le souhaitez amené à coder à l'aide de LLMs dans le cadre de votrre pratiqe, mais il est demandé dans le cadre de l'exercice de faire sans afin de comprendre votre vision "lead", plus que votre capacité à produire du code.

## Base de données

L'appli attend une base PostgreSQL locale. Pour créer le rôle et la base correspondant à la configuration fournie :

```bash
sudo -u postgres psql -c "CREATE ROLE parcelles LOGIN PASSWORD 'Parcelles2024!'" -c "CREATE DATABASE parcelles OWNER parcelles"
```

Pour tout supprimer après l'exercice :

```bash
sudo -u postgres psql -c "DROP DATABASE parcelles" -c "DROP ROLE parcelles"
```

Voici toutes les infos dont vous disposez, bonne chance !
