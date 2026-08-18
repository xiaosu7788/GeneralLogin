ALTER TABLE `UserProfile`
  ADD COLUMN `isBootstrapAdmin` BOOLEAN NOT NULL DEFAULT false;

UPDATE `UserProfile`
SET `isBootstrapAdmin` = true,
    `isAdminSnapshot` = true
WHERE `id` = (
  SELECT `first_account`.`id`
  FROM (
    SELECT `id`
    FROM `UserProfile`
    WHERE `account` IS NOT NULL
    ORDER BY `createdAt` ASC, `id` ASC
    LIMIT 1
  ) AS `first_account`
);
