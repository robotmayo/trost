DROP TABLE IF EXISTS trost_posts;
CREATE TABLE trost_posts(
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  raw MEDIUMTEXT NOT NULL,
  output MEDIUMTEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- See data/post for all default types
  visibility VARCHAR(50) NOT NULL DEFAULT 'private', -- See data/post for all default visibility methods
  author_id INT NOT NULL,
  published_at DATETIME,
  published_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  UNIQUE INDEX `slug`(`slug`)
);

DROP TABLE IF EXISTS trost_users;
CREATE TABLE trost_users(
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password VARCHAR(60) NOT NULL,
  email VARCHAR(255),
  image VARCHAR(1000), -- IMAGES SHOULD BE PATHS RESOLVED BY THE IMAGE SERVICE
  bio VARCHAR(500),
  title VARCHAR(64),
  website VARCHAR(1000),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- See data/user for all default types
  lang VARCHAR(10) NOT NULL DEFAULT 'en_US', -- See data/user for all current types
  last_login DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  visibility VARCHAR(50) NOT NULL DEFAULT 'public', -- See data/user for all default types
  UNIQUE INDEX `email`(`email`),
  UNIQUE INDEX `username`(`username`)
);

DROP TABLE IF EXISTS trost_settings;
CREATE TABLE trost_settings(
  id INT PRIMARY KEY AUTO_INCREMENT,
  tkey VARCHAR(255) NOT NULL,
  tvalue TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  UNIQUE INDEX `tkey`(`tkey`)
);

DROP TABLE IF EXISTS trost_tags;
CREATE TABLE trost_tags(
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  image VARCHAR(1000), -- IMAGES SHOULD BE PATHS RESOLVED BY THE IMAGE SERVICE
  is_cat BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  UNIQUE INDEX `slug`(`slug`),
  UNIQUE INDEX `name`(`name`)
);

DROP TABLE IF EXISTS trost_post_tags;
CREATE TABLE trost_post_tags(
  post_id INT NOT NULL,
  tag_id INT NOT NULL,
  priority INT NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS trost_plugins;
CREATE TABLE trost_plugins(
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL, 
  UNIQUE INDEX `name`(`name`)
);

DROP TABLE IF EXISTS trost_plugins_meta;
CREATE TABLE trost_plugins_meta(
  plugin_id INT NOT NULL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  website VARCHAR(1000) NOT NULL,
  support VARCHAR(1000)
);

DROP TABLE IF EXISTS trost_plugins_settings;
CREATE TABLE trost_plugins_settings(
  id INT PRIMARY KEY AUTO_INCREMENT,
  tkey VARCHAR(255) NOT NULL,
  tvalue TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT NOT NULL,
  UNIQUE INDEX `tkey`(`tkey`)
);
