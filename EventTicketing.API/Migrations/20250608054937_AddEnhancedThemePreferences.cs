using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventTicketing.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEnhancedThemePreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccentColor",
                table: "UserPreferences",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "CompactMode",
                table: "UserPreferences",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FontSize",
                table: "UserPreferences",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccentColor",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "CompactMode",
                table: "UserPreferences");

            migrationBuilder.DropColumn(
                name: "FontSize",
                table: "UserPreferences");
        }
    }
}
