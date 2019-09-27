```sql
// 生产车号列表
WITH carts AS (
	SELECT
		A .品种,
		A .车号,
		A .工艺,
		A .机台,
		A .工序
	FROM
		VIEW_CARTFINDER A
	WHERE
		TO_CHAR (A .完成时间, 'YYYYMMDD') BETWEEN 20181019
	AND 20181019
	AND A .工序 = '印码'
) SELECT DISTINCT
	A .品种 "prod_name",
	A .车号 "cart_number",
	A .工艺 "proc_name",
	A .机台 "machine_name"
FROM
	carts A
INNER JOIN VIEW_CARTFINDER b ON A .车号 = b.车号
AND A .工序 = b.工序
GROUP BY
	A .品种,
	A .车号,
	A .工艺,
	A .机台
HAVING
	SUM (B.产量) = 10000
order by 2 desc
```

```sql
// 获取指定日期丝印产品列表及判废量
SELECT
	A .cart_number,
	A .Product_ID,
	b.product_name,
	A .start_date,
	c.machine_waster_number AS PFNum
FROM
	wip_jobs A
INNER JOIN dic_products b ON A .product_id = b.product_id
INNER JOIN qa_inspect_master c ON c.job_id = A .job_id
WHERE
	(
		TO_CHAR (A .start_date, 'YYYYMMDD') BETWEEN '20181019'
		AND '20181019'
	) -- And a.Product_ID
AND c.item_flag = 1
```

```sql
// M97车号列表判废量
SELECT
	A .cart_number,
	b.product_name,
	A .start_date,
	c.machine_waster_number AS PFNum
FROM
	wip_jobs A
INNER JOIN dic_products b ON A .product_id = b.product_id
INNER JOIN qa_inspect_master c ON c.job_id = A .job_id
WHERE
	A .cart_number IN (
		'1880E726',
		'1880E749',
		'1880E781',
		'1880E584',
		'1880E645',
		'1880E738',
		'1880E743',
		'1880E628',
		'1880E746',
		'1880E670',
		'1880E635',
		'1880E819',
		'1880E665',
		'1880E649',
		'1880E659',
		'1880E707',
		'1880E693',
		'1880E667',
		'1880E681',
		'1880E788',
		'1880E575',
		'1880E703',
		'1880E639',
		'1880E652',
		'1880E599'
	)
AND c.item_flag = 1
```

> 根据上方车号列表取出未上传车号信息并做提示。

```sql
// 指定日期码后核查上传车号列表
SELECT
	A .cart_number,
	b.product_name,
	A .start_date,
	c.machine_waster_number AS PFNum
FROM
	qfm_wip_jobs A
INNER JOIN dic_products b ON A .product_id = b.product_id
INNER JOIN qfm_qa_inspect_master c ON c.job_id = A .job_id
WHERE
	(
		TO_CHAR (A .start_date, 'YYYYMMDD') BETWEEN '20181019'
		AND '20181019'
	)
AND c.item_flag = 1
```

```sql
// 指定车号列表判废数
SELECT
	A .cart_number,
	b.product_name,
	A .start_date,
	c.machine_waster_number AS PFNum
FROM
	qfm_wip_jobs A
INNER JOIN dic_products b ON A .product_id = b.product_id
INNER JOIN qfm_qa_inspect_master c ON c.job_id = A .job_id
WHERE a.CART_NUMBER in ('1880E711',
  '1830C614',
  '1820E089',
  '1820E092',
  '1820D999',
  '1830C618',
  '1820E051',
  '1820E280',
  '1820D997',
  '1820E064',
  '1820E193',
  '1820E216',
  '1820E227',
  '1830C692',
  '1830C709',
  '1830C720',
  '1880E621',
  '1820E302',
  '1880E728',
  '1880E610',
  '1820E088',
  '1820E065',
  '1820E253',
  '1880E851',
  '1830C612',
  '1820E080',
  '1830C645',
  '1820E243',
  '1820E039',
  '1820E252',
  '1820E048',
  '1820E053',
  '1820E072',
  '1880E678',
  '1880E748',
  '1820E240',
  '1820E027',
  '1820E063',
  '1820E225',
  '1880E676',
  '1880E721',
  '1820E082',
  '1830C660',
  '1820D990',
  '1830C611',
  '1820E067',
  '1820E284',
  '1820E298',
  '1820E083',
  '1820E212',
  '1820E249',
  '1820E035',
  '1830C568',
  '1830C613',
  '1820E170',
  '1820E254',
  '1820E071' )
AND c.item_flag = 1
```

```sql
// 根据车号列表获取上传情况以及判废数量
SELECT
	0 "type",
		A.cart_number "cart_number",
		b.product_name "product_name",
		A .start_date "start_date",
		c.machine_waster_number AS "pf_num"
FROM
	qfm_wip_jobs A
INNER JOIN dic_products b ON A .product_id = b.product_id
INNER JOIN qfm_qa_inspect_master c ON c.job_id = A .job_id
WHERE
	A .CART_NUMBER IN (
		'1880E711',
		'1830C614',
		'1820E089',
		'1820E092',
		'1820D999',
		'1830C618',
		'1820E051',
		'1820E280',
		'1820D997',
		'1820E064',
		'1820E193',
		'1820E216',
		'1820E227',
		'1830C692',
		'1830C709',
		'1830C720',
		'1880E621',
		'1820E302',
		'1880E728',
		'1880E610',
		'1820E088',
		'1820E065',
		'1820E253',
		'1880E851',
		'1830C612',
		'1820E080',
		'1830C645',
		'1820E243',
		'1820E039',
		'1820E252',
		'1820E048',
		'1820E053',
		'1820E072',
		'1880E678',
		'1880E748',
		'1820E240',
		'1820E027',
		'1820E063',
		'1820E225',
		'1880E676',
		'1880E721',
		'1820E082',
		'1830C660',
		'1820D990',
		'1830C611',
		'1820E067',
		'1820E284',
		'1820E298',
		'1820E083',
		'1820E212',
		'1820E249',
		'1820E035',
		'1830C568',
		'1830C613',
		'1820E170',
		'1820E254',
		'1820E071'
	)
AND c.item_flag = 1
UNION ALL
	SELECT
		1 "type",
		A.cart_number "cart_number",
		b.product_name "product_name",
		A .start_date "start_date",
		c.machine_waster_number AS "pf_num"
	FROM
		wip_jobs A
	INNER JOIN dic_products b ON A .product_id = b.product_id
	INNER JOIN qa_inspect_master c ON c.job_id = A .job_id
	WHERE
		A .cart_number IN (
			'1880E726',
			'1880E749',
			'1880E781',
			'1880E584',
			'1880E645',
			'1880E738',
			'1880E743',
			'1880E628',
			'1880E746',
			'1880E670',
			'1880E635',
			'1880E819',
			'1880E665',
			'1880E649',
			'1880E659',
			'1880E707',
			'1880E693',
			'1880E667',
			'1880E681',
			'1880E788',
			'1880E575',
			'1880E703',
			'1880E639',
			'1880E652',
			'1880E599'
		)
	AND c.item_flag = 1
```
