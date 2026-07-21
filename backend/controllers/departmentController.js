const Department = require("../models/Department");
const asyncHandler = require("../utils/asyncHandler");

exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Department name is required" });

  const existing = await Department.findOne({ name: name.trim() });
  if (existing) return res.status(400).json({ success: false, message: "Department already exists" });

  const department = await Department.create({ name: name.trim(), description });
  res.status(201).json({ success: true, message: "Department created", department });
});

exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });

  console.log(departments);

  res.json({
    success: true,
    count: departments.length,
    departments,
  });
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });

  if (name) department.name = name;
  if (description !== undefined) department.description = description;
  if (typeof isActive === "boolean") department.isActive = isActive;

  await department.save();
  res.json({ success: true, message: "Department updated", department });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: "Department not found" });
  await department.deleteOne();
  res.json({ success: true, message: "Department deleted" });
});
