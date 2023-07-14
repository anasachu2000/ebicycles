const salesReportExel = async (req, res, next) => {
    try {
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      const adminData = await User.findById(req.session.auser_id);
  
      let matchQuery = {
        "products.status": "Delivered",
      };
  
      if (parseInt(startDate) !== 0) {
        matchQuery = {
          ...matchQuery,
          $and: [
            { "products.deliveryDate": { $gt: new Date(startDate) } },
            { "products.deliveryDate": { $lt: new Date(endDate) } },
          ],
        };
      }
  
      const orders = await Order.aggregate([
        { $unwind: "$products" },
        { $match: matchQuery },
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: "products",
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $addFields: {
            productDetails: { $arrayElemAt: ["$productDetails", 0] },
          },
        },
      ]);
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Product Name", key: "productName", width: 30 },
        { header: "User Name", key: "userName", width: 20 },
        { header: "Order Date", key: "orderDate", width: 15 },
        { header: "Payment Method", key: "paymentMethod", width: 15 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
      ];
  
      orders.forEach((o, i) => {
        const productName = o.productDetails ? o.productDetails.productName : "N/A";
        worksheet.addRow({
          no: i + 1,
          productName: productName,
          userName: o.userName,
          orderDate: o.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g, '-'),
          paymentMethod: o.paymentMethod,
          quantity: o.products.count,
          totalAmount: o.totalAmount,
        });
      });
  
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");
      await workbook.xlsx.write(res);
    } catch (err) {
      next(err);
    }
  };