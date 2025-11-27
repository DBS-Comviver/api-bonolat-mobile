CREATE TABLE IF NOT EXISTS `dbs_fr_caixas` (
    `cod_caixa` INT NOT NULL AUTO_INCREMENT,
    `cod_estabel` VARCHAR(10) NOT NULL,
    `cod_deposito` VARCHAR(15) NOT NULL,
    `cod_local` VARCHAR(15) NOT NULL,
    `it_codigo` VARCHAR(20) NOT NULL,
    `desc_item` VARCHAR(100) NULL,
    `cod_lote` VARCHAR(45) NOT NULL,
    `data_lote` DATE NULL,
    `quantidade` DECIMAL(30, 5) NOT NULL,
    `ordem_prod` INT NULL,
    `batalada` VARCHAR(40) NULL,
    `usuario` VARCHAR(45) NULL,
    `data_hora_fracionamento` DATETIME NULL,
    PRIMARY KEY (`cod_caixa`),
    INDEX `idx_cod_estabel` (`cod_estabel`),
    INDEX `idx_it_codigo` (`it_codigo`),
    INDEX `idx_cod_lote` (`cod_lote`),
    INDEX `idx_usuario` (`usuario`),
    INDEX `idx_ordem_prod` (`ordem_prod`),
    INDEX `idx_batalada` (`batalada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dbs_fr_itens_caixa` (
    `cod_item_caixa` INT NOT NULL AUTO_INCREMENT,
    `cod_caixa` INT NOT NULL,
    `it_codigo` VARCHAR(20) NOT NULL,
    `desc_item` VARCHAR(100) NULL,
    `quantidade` DECIMAL(30, 5) NOT NULL,
    PRIMARY KEY (`cod_item_caixa`),
    INDEX `idx_cod_caixa` (`cod_caixa`),
    CONSTRAINT `fk_itens_caixa_caixa` 
        FOREIGN KEY (`cod_caixa`) 
        REFERENCES `dbs_fr_caixas` (`cod_caixa`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dbs_fr_lotes_itens_caixa` (
    `cod_lote_it_cx` INT NOT NULL AUTO_INCREMENT,
    `cod_item_caixa` INT NOT NULL,
    `cod_lote` VARCHAR(45) NOT NULL,
    `data_validade` DATE NULL,
    `data_fabricacao` DATE NULL,
    `quantidade` DECIMAL(30, 5) NOT NULL,
    PRIMARY KEY (`cod_lote_it_cx`),
    INDEX `idx_cod_item_caixa` (`cod_item_caixa`),
    CONSTRAINT `fk_lotes_itens_item` 
        FOREIGN KEY (`cod_item_caixa`) 
        REFERENCES `dbs_fr_itens_caixa` (`cod_item_caixa`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

